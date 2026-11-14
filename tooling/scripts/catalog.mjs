import { readFileSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const root = fileURLToPath(new URL('../../', import.meta.url));
const required = (condition, message) => { if (!condition) throw new Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const encodePath = path => path.split('/').map(encodeURIComponent).join('/');
export const LANGUAGES = ['en', 'ko'];
export const SHOWCASE = 'template-showcase';
// 사이트 경로는 모두 /<언어>/로 시작한다. PDF와 쇼케이스는 한국어 자료라 /ko/ 아래에 둔다.
export const slidesPath = language => `${language}/slides/`;
export const deckLanguage = (talk, language) => language === 'en' && talk.slidesEn ? 'en' : 'ko';
export const deckPath = (talk, language) => `${slidesPath(deckLanguage(talk, language))}${talk.id}/`;
export const pdfPath = talk => `${slidesPath('ko')}${talk.pdf}`;
export const showcasePath = `${slidesPath('ko')}${SHOWCASE}/`;

export const DEFAULT_SITE = {
  title: 'Slides · Jmnote',
  title_ko: '슬라이드 · Jmnote',
  description: 'Slide decks and PDFs from conference talks and public presentations on Kubernetes, Cloud Native, Go, and AI Agent.',
  description_ko: 'Kubernetes, Cloud Native, Go, AI Agent를 주제로 컨퍼런스와 세미나에서 발표한 자료를 모았습니다.',
  origin: 'https://jmnote.com',
  base: '/',
  repository: 'https://github.com/jmnote/jmnote.github.io',
};

export function validateCatalog(data, directory = root) {
  const talks = Array.isArray(data) ? data : data?.talks;
  required(Array.isArray(talks) && talks.length, 'talks must be defined in tooling/site/talks.yaml');
  const site = { ...DEFAULT_SITE, ...data?.site };
  required(text(site.title) && text(site.description), 'site.title and site.description are required');
  required(typeof site.base === 'string' && /^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(site.base), 'site.base must be a path starting and ending with /');
  required(typeof site.repository === 'string' && /^https:\/\//.test(site.repository), 'site.repository must be an HTTPS URL');
  required(typeof site.origin === 'string' && /^https:\/\/[^/\s?#]+$/.test(site.origin), 'site.origin must be an HTTPS origin without a trailing slash');
  const ids = new Set();
  function source(path, extension, talk) {
    required(typeof path === 'string' && /^\d{4}\//.test(path) && !path.includes('\\') && !path.split('/').some(part => !part || part === '.' || part === '..') && path.endsWith(extension), `Invalid source path: ${path}`);
    let fullPath;
    try {
      fullPath = realpathSync(resolve(directory, path));
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
        throw new Error(`Talk "${talk.id}" (${talk.date}): missing ${extension === '.pdf' ? 'PDF' : 'Slidev source'}: ${path}`, { cause: error });
      }
      throw error;
    }
    const rel = relative(realpathSync(directory), fullPath);
    required(rel !== '..' && !rel.startsWith('..' + sep) && statSync(fullPath).isFile(), `Source must be a file inside the repository: ${path}`);
  }
  const resolvedTalks = talks.map(talk => {
    required(typeof talk.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(talk.id) && !ids.has(talk.id), `Invalid or duplicate talk id: ${talk.id}`);
    required(!/^\d{4}$/.test(talk.id) && talk.id !== SHOWCASE, `Reserved talk id: ${talk.id}`);
    ids.add(talk.id);
    required(text(talk.title), `Missing title: ${talk.id}`);
    for (const key of Object.keys(talk)) {
      if (key.startsWith('title_')) {
        required(text(talk[key]), `Invalid ${key}: ${talk.id}`);
      }
    }
    required(typeof talk.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(talk.date) && !Number.isNaN(Date.parse(talk.date)) && new Date(talk.date).toISOString().slice(0, 10) === talk.date, `Invalid date: ${talk.id}`);
    required(text(talk.event), `Invalid event: ${talk.id}`);
    required(talk.slides_en === undefined || typeof talk.slides_en === 'boolean', `slides_en must be a boolean: ${talk.id}`);
    required(!talk.slides_en || talk.slides === true, `slides_en requires slides: ${talk.id}`);
    required(talk.slides === undefined || typeof talk.slides === 'boolean', `slides must be a boolean: ${talk.id}`);
    const stem = `${talk.date.slice(0, 4)}/${talk.date}-${talk.id}`;
    const pdf = `${stem}.pdf`;
    const slides = talk.slides === true ? `${stem}/slides.md` : undefined;
    const slidesEn = talk.slides_en === true ? `${stem}/slides.en.md` : undefined;
    if (slides) {
      source(slides, '.md', talk);
    }
    if (slidesEn) source(slidesEn, '.md', talk);
    source(pdf, '.pdf', talk);
    return { ...talk, pdf, slides, slidesEn };
  });
  return { site, talks: resolvedTalks.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)) };
}

export function loadCatalog(directory = root) {
  return validateCatalog(parse(readFileSync(resolve(directory, 'tooling/site/talks.yaml'), 'utf8')), directory);
}

const PDF_ICON_SVG = '<svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M30 18v-2h-6v10h2v-4h3v-2h-3v-2zm-11 8h-4V16h4a3.003 3.003 0 0 1 3 3v4a3.003 3.003 0 0 1-3 3m-2-2h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2Zm-6-8H6v10h2v-3h3a2.003 2.003 0 0 0 2-2v-3a2 2 0 0 0-2-2m-3 5v-3h3l.001 3Z"/><path d="M22 14v-4a.91.91 0 0 0-.3-.7l-7-7A.9.9 0 0 0 14 2H4a2.006 2.006 0 0 0-2 2v24a2 2 0 0 0 2 2h16v-2H4V4h8v6a2.006 2.006 0 0 0 2 2h6v2Zm-8-4V4.4l5.6 5.6Z"/></svg>';
const LANGUAGE_NAMES = { en: 'English', ko: '한국어' };
const LOCALES = { en: 'en_US', ko: 'ko_KR' };

// 홈(page '')과 슬라이드 목록(page 'slides/')이 함께 쓰는 문서 틀. 언어별 HTML을 빌드 때 만든다.
export function renderPage({ site, language, page, title, description, main, footer, xDefault }) {
  const e = escapeHtml;
  const t = (en, ko) => language === 'en' ? en : ko;
  const url = lang => `${site.origin}${site.base}${lang}/${page}`;
  const nav = (path, label) => `<a href="${site.base}${language}/${path}"${path === page ? ' aria-current="page"' : ''}>${label}</a>`;
  const switchLink = lang => `<a href="${site.base}${lang}/${page}" hreflang="${lang}" lang="${lang}" data-language="${lang}"${lang === language ? ' class="active" aria-current="true"' : ''}>${LANGUAGE_NAMES[lang]}</a>`;
  const themeLabel = t('Switch theme', '테마 전환');
  return `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)}</title>
  <meta name="description" content="${e(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Jmnote">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:image" content="https://github.com/jmnote.png?size=512">
  <meta property="og:url" content="${url(language)}">
  <meta property="og:locale" content="${LOCALES[language]}">
  ${LANGUAGES.filter(lang => lang !== language).map(lang => `<meta property="og:locale:alternate" content="${LOCALES[lang]}">`).join('\n  ')}
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${e(title)}">
  <meta name="twitter:description" content="${e(description)}">
  <meta name="twitter:image" content="https://github.com/jmnote.png?size=512">
  <link rel="canonical" href="${url(language)}">
  ${LANGUAGES.map(lang => `<link rel="alternate" hreflang="${lang}" href="${url(lang)}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${xDefault}">
  <link rel="icon" href="https://github.com/jmnote.png" type="image/png">
  <link rel="stylesheet" href="${site.base}assets/style.css">
  <script src="${site.base}assets/language.js"></script>
  <script src="${site.base}assets/theme.js"></script>
</head>
<body>
  <div class="container">
    <header class="site-header">
      <nav class="site-nav" aria-label="${t('Site', '사이트')}">
        ${nav('', t('Home', '홈'))}
        ${nav('slides/', t('Slides', '슬라이드'))}
      </nav>
      <div class="site-controls">
        <div class="lang-switch">${switchLink('en')}<span class="sep">/</span>${switchLink('ko')}</div>
        <button id="theme-toggle" type="button" aria-label="${themeLabel}" title="${themeLabel}">
          <img id="theme-icon" src="${site.base}assets/sun.svg" alt="">
        </button>
      </div>
    </header>

${main}

    <footer class="site-footer">
      <p>${footer}</p>
    </footer>
  </div>
</body>
</html>
`;
}

export function renderIndex({ site, talks }, language, { showcase = false } = {}) {
  const e = escapeHtml;
  const t = (en, ko) => language === 'en' ? en : ko;
  const years = [...new Set(talks.map(talk => talk.date.slice(0, 4)))];
  const description = t(site.description, site.description_ko || site.description);

  const tableRows = years.map(year => {
    const entries = talks.filter(talk => talk.date.startsWith(year));
    const yearRow = `<tr class="year-row" id="year-${year}">
      <th colspan="2" scope="colgroup" class="year-header">${year}</th>
    </tr>`;

    const talkRows = entries.map(talk => {
      const title = t(talk.title_en || talk.title, talk.title_ko || talk.title);
      const deckLang = deckLanguage(talk, language);
      const titleHtml = talk.slides
        ? `<a href="${site.base}${encodePath(deckPath(talk, language))}" class="talk-link"${deckLang === language ? '' : ` hreflang="${deckLang}"`}>${e(title)}</a>`
        : `<span class="talk-title">${e(title)}</span>`;
      const pdfBtn = `<a href="${site.base}${encodePath(pdfPath(talk))}" class="pdf-btn" title="PDF" aria-label="PDF"${language === 'ko' ? '' : ' hreflang="ko"'} target="_blank" rel="noopener">${PDF_ICON_SVG}</a>`;

      return `<tr class="talk-row">
        <td>
          <div class="talk-heading">${titleHtml}${pdfBtn}</div>
        </td>
        <td class="col-event">
          <div class="talk-date">${talk.date}</div>
          <div class="talk-event">${e(talk.event)}</div>
        </td>
      </tr>`;
    }).join('\n');

    return `${yearRow}\n${talkRows}`;
  }).join('\n');

  const main = `    <main>
      <div class="hero">
        <div class="hero-bio">
          <h1>${t('Slides', '슬라이드')}</h1>
          <p>${e(description)}</p>
        </div>
      </div>

      <section id="talks">
        <div class="table-wrapper talks-wrapper">
          <table class="talks-table">
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </section>
    </main>`;
  const footer = `<a href="${e(site.repository)}/blob/main/LICENSE" target="_blank" rel="noopener">Apache-2.0</a> &middot; <a href="${e(site.repository)}" target="_blank" rel="noopener">GitHub</a>${showcase ? ` &middot; <a href="${site.base}${showcasePath}">Template Showcase</a>` : ''}`;
  return renderPage({
    site, language, page: 'slides/', main, footer, description,
    title: t(site.title, site.title_ko || site.title),
    xDefault: `${site.origin}${site.base}${slidesPath('en')}`,
  });
}

export function renderReadmeTable({ site, talks }) {
  const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
  return ['| 제목 | 웹 | PDF | 날짜 | 행사 |', '|---|:---:|:---:|---|---|', ...talks.map(talk => {
    const web = talk.slides
      ? `[<img src="tooling/site/icons/globe.svg" width="20" height="20" alt="웹에서 보기">](${site.origin}${site.base}${encodePath(deckPath(talk, 'ko'))})`
      : '—';
    const pdf = `[<img src="tooling/site/icons/file-pdf-gray.svg" width="20" height="20" alt="PDF 다운로드">](${encodePath(talk.pdf)}?raw=true)`;
    return `| ${cell(talk.title)} | ${web} | ${pdf} | ${talk.date} | ${cell(talk.event)} |`;
  })].join('\n');
}
