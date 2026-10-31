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
    if (talk.title_en !== undefined) {
      required(text(talk.title_en), `Invalid title_en: ${talk.id}`);
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

export function renderIndex({ site, talks }, lang = 'en') {
  const e = escapeHtml;
  const isKo = lang === 'ko';
  const pageTitle = isKo ? (site.title_ko || site.title) : site.title;
  const pageDesc = isKo ? (site.description_ko || site.description) : site.description;
  const years = [...new Set(talks.map(talk => talk.date.slice(0, 4)))];

  const sections = years.map(year => {
    const entries = talks.filter(talk => talk.date.startsWith(year));
    return `
      <h3 class="section-title" id="year-${year}">${year}</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th scope="col" style="width: 100px;">${isKo ? '일자' : 'Date'}</th>
              <th scope="col">${isKo ? '제목' : 'Title'}</th>
              <th scope="col" style="width: 220px;">${isKo ? '행사' : 'Event'}</th>
              <th scope="col" style="width: 140px; text-align: right;">${isKo ? '자료' : 'Links'}</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map(talk => {
              const mainTitle = isKo ? talk.title : (talk.title_en || talk.title);
              const subTitle = (!isKo && talk.title_en && talk.title_en !== talk.title) ? talk.title : null;
              return `<tr>
              <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 13px;">${talk.date.slice(5).replace('-', '.')}</td>
              <td style="font-weight: 600;">
                <div>${e(mainTitle)}</div>
                ${subTitle ? `<div style="font-size: 13px; font-weight: 400; color: var(--text-muted); margin-top: 2px;">${e(subTitle)}</div>` : ''}
              </td>
              <td style="color: var(--text-muted); font-size: 13.5px;">${e(talk.event)}</td>
              <td style="text-align: right; white-space: nowrap;">
                ${talk.slides ? `<a href="${site.base}${encodePath(deckPath(talk))}" style="margin-right: 8px;">${isKo ? '슬라이드' : 'Slides'} ↗</a>` : ''}
                <a href="${site.base}${encodePath(talk.pdf)}">PDF ↗</a>
              </td>
            </tr>`;
            }).join('\n')}
          </tbody>
        </table>
      </div>
    `;
  }).join('\n');

  const navHome = isKo ? '<a href="/ko/">홈</a>' : '<a href="/">Home</a>';
  const navSlides = isKo ? `<a href="${site.base}ko/" aria-current="page">슬라이드</a>` : `<a href="${site.base}" aria-current="page">Slides</a>`;
  const langSwitch = isKo
    ? `<div class="lang-switch"><a href="${site.base}">EN</a><span class="sep">/</span><span class="active">KO</span></div>`
    : `<div class="lang-switch"><span class="active">EN</span><span class="sep">/</span><a href="${site.base}ko/">KO</a></div>`;
  const themeTitle = isKo ? '테마 전환' : 'Switch theme';

  return `<!doctype html>
<html lang="${isKo ? 'ko' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${e(pageDesc)}">
  <title>${e(pageTitle)}</title>
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
        ${sections}
      </section>
    </main>

    <footer class="site-footer">
      <p>&copy; Jmnote &middot; <a href="${e(site.repository)}" target="_blank" rel="noopener">GitHub</a></p>
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
