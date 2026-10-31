import { readFileSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const root = fileURLToPath(new URL('../../', import.meta.url));
const required = (condition, message) => { if (!condition) throw new Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const encodePath = path => path.split('/').map(encodeURIComponent).join('/');
export const deckPath = talk => talk.id + '/';

export const DEFAULT_SITE = {
  title: 'Slides · Jmnote',
  title_ko: '슬라이드 · Jmnote',
  description: 'Slide decks and PDFs from conference talks and public presentations on Kubernetes, Cloud Native, Go, and AI Agent.',
  description_ko: 'Kubernetes, Cloud Native, Go, AI Agent를 주제로 컨퍼런스와 세미나에서 발표한 자료를 모았습니다.',
  origin: 'https://jmnote.com',
  base: '/slides/',
  repository: 'https://github.com/jmnote/slides',
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
    required(!/^\d{4}$/.test(talk.id), `Reserved talk id (year directory): ${talk.id}`);
    ids.add(talk.id);
    required(text(talk.title), `Missing title: ${talk.id}`);
    for (const key of Object.keys(talk)) {
      if (key.startsWith('title_')) {
        required(text(talk[key]), `Invalid ${key}: ${talk.id}`);
      }
    }
    required(typeof talk.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(talk.date) && !Number.isNaN(Date.parse(talk.date)) && new Date(talk.date).toISOString().slice(0, 10) === talk.date, `Invalid date: ${talk.id}`);
    required(text(talk.event), `Invalid event: ${talk.id}`);
    required(talk.slides === undefined || typeof talk.slides === 'boolean', `slides must be a boolean: ${talk.id}`);
    const stem = `${talk.date.slice(0, 4)}/${talk.date}-${talk.id}`;
    const pdf = `${stem}.pdf`;
    const slides = talk.slides === true ? `${stem}/slides.md` : undefined;
    if (slides) {
      source(slides, '.md', talk);
    }
    source(pdf, '.pdf', talk);
    return { ...talk, pdf, slides };
  });
  return { site, talks: resolvedTalks.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)) };
}

export function loadCatalog(directory = root) {
  return validateCatalog(parse(readFileSync(resolve(directory, 'tooling/site/talks.yaml'), 'utf8')), directory);
}

const PDF_ICON_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4 1h10l7 7v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Zm0 2v18h15V9h-6V3Zm11 1v3h3Z" fill-rule="evenodd"/><g transform="translate(-.5 9) scale(.75)"><path d="M5 3h4a3 3 0 0 1 0 6H7v4H5zm2 2v2h2a1 1 0 0 0 0-2z" fill-rule="evenodd"/><path d="M13 3h3c3 0 4 2 4 5s-1 5-4 5h-3zm2 2v6h1c1.5 0 2-1 2-3s-.5-3-2-3z" fill-rule="evenodd"/><path d="M22 3h6v2h-4v2h3v2h-3v4h-2z"/></g></svg>';

export function renderIndex({ site, talks }, lang = 'en') {
  const e = escapeHtml;
  const isKo = lang === 'ko';
  const pageTitle = isKo ? (site.title_ko || site.title) : site.title;
  const pageDesc = isKo ? (site.description_ko || site.description) : site.description;
  const years = [...new Set(talks.map(talk => talk.date.slice(0, 4)))];

  const tableRows = years.map(year => {
    const entries = talks.filter(talk => talk.date.startsWith(year));
    const yearRow = `<tr class="year-row" id="year-${year}">
      <th colspan="2" scope="colgroup" class="year-header">${year}</th>
    </tr>`;

    const talkRows = entries.map(talk => {
      const mainTitle = talk.title;
      const langTitle = talk[`title_${lang}`];
      const subTitle = (langTitle && langTitle !== talk.title) ? langTitle : null;
      const titleHtml = talk.slides
        ? `<a href="${site.base}${encodePath(deckPath(talk))}" class="talk-link">${e(mainTitle)}</a>`
        : `<span class="talk-title">${e(mainTitle)}</span>`;
      const pdfBtn = `<a href="${site.base}${encodePath(talk.pdf)}" class="pdf-btn" title="PDF" aria-label="PDF" target="_blank" rel="noopener">${PDF_ICON_SVG}</a>`;

      return `<tr class="talk-row">
        <td>
          <div class="talk-heading">${titleHtml}${pdfBtn}</div>
          ${subTitle ? `<div class="talk-subtitle">${e(subTitle)}</div>` : ''}
        </td>
        <td class="col-event">
          <div class="talk-date">${talk.date}</div>
          <div class="talk-event">${e(talk.event)}</div>
        </td>
      </tr>`;
    }).join('\n');

    return `${yearRow}\n${talkRows}`;
  }).join('\n');

  const navHome = isKo ? '<a href="/ko/">홈</a>' : '<a href="/">Home</a>';
  const navSlides = isKo ? `<a href="${site.base}ko/" aria-current="page">슬라이드</a>` : `<a href="${site.base}" aria-current="page">Slides</a>`;
  const langSwitch = isKo
    ? `<div class="lang-switch"><a href="${site.base}">English</a><span class="sep">/</span><span class="active">한국어</span></div>`
    : `<div class="lang-switch"><span class="active">English</span><span class="sep">/</span><a href="${site.base}ko/">한국어</a></div>`;
  const themeTitle = isKo ? '테마 전환' : 'Switch theme';

  return `<!doctype html>
<html lang="${isKo ? 'ko' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${e(pageDesc)}">
  <title>${e(pageTitle)}</title>
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Jmnote">
  <meta property="og:title" content="${e(pageTitle)}">
  <meta property="og:description" content="${e(pageDesc)}">
  <meta property="og:image" content="https://github.com/jmnote.png?size=512">
  <meta property="og:url" content="${site.origin}${site.base}${isKo ? 'ko/' : ''}">
  <meta property="og:locale" content="${isKo ? 'ko_KR' : 'en_US'}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${e(pageTitle)}">
  <meta name="twitter:description" content="${e(pageDesc)}">
  <meta name="twitter:image" content="https://github.com/jmnote.png?size=512">
  <link rel="canonical" href="${site.origin}${site.base}${isKo ? 'ko/' : ''}">
  <link rel="icon" href="https://github.com/jmnote.png" type="image/png">
  <link rel="stylesheet" href="${site.base}assets/style.css">
  <script src="${site.base}assets/theme.js"></script>
</head>
<body>
  <div class="container">
    <header class="site-header">
      <nav class="site-nav" aria-label="${isKo ? '사이트' : 'Site'}">
        ${navHome}
        ${navSlides}
      </nav>
      <div class="site-controls">
        ${langSwitch}
        <button id="theme-toggle" type="button" aria-label="${themeTitle}" title="${themeTitle}">
          <img id="theme-icon" src="${site.base}assets/sun.svg" alt="">
        </button>
      </div>
    </header>

    <main>
      <div class="hero">
        <div class="hero-bio">
          <h1>${isKo ? '슬라이드' : 'Slides'}</h1>
          <p>${e(pageDesc)}</p>
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
    </main>

    <footer class="site-footer">
      <p><a href="${e(site.repository)}/blob/main/LICENSE" target="_blank" rel="noopener">Apache-2.0</a> &middot; <a href="${e(site.repository)}" target="_blank" rel="noopener">GitHub</a></p>
    </footer>
  </div>
</body>
</html>
`;
}

export function renderReadmeTable({ site, talks }) {
  const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
  return ['| 제목 | 웹 | PDF | 날짜 | 행사 |', '|---|:---:|:---:|---|---|', ...talks.map(talk => {
    const web = talk.slides
      ? `[<img src="tooling/site/icons/globe.svg" width="20" height="20" alt="웹에서 보기">](${site.origin}${site.base}${encodePath(deckPath(talk))})`
      : '—';
    const pdf = `[<img src="tooling/site/icons/file-pdf.svg" width="20" height="20" alt="PDF 다운로드">](${encodePath(talk.pdf)}?raw=true)`;
    return `| ${cell(talk.title)} | ${web} | ${pdf} | ${talk.date} | ${cell(talk.event)} |`;
  })].join('\n');
}
