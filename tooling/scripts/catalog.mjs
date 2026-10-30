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

export function validateCatalog(data, directory = root) {
  required(data?.site && Array.isArray(data.talks) && data.talks.length, 'site and talks must be defined in tooling/site/talks.yaml');
  const { site, talks } = data;
  required(text(site.title) && text(site.description), 'site.title and site.description are required');
  required(typeof site.base === 'string' && /^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(site.base), 'site.base must be a path starting and ending with /');
  required(typeof site.repository === 'string' && /^https:\/\//.test(site.repository), 'site.repository must be an HTTPS URL');
  const ids = new Set();
  function source(path, extension) {
    required(typeof path === 'string' && /^\d{4}\//.test(path) && !path.includes('\\') && !path.split('/').some(part => !part || part === '.' || part === '..') && path.endsWith(extension), `Invalid source path: ${path}`);
    const fullPath = realpathSync(resolve(directory, path));
    const rel = relative(realpathSync(directory), fullPath);
    required(rel !== '..' && !rel.startsWith('..' + sep) && statSync(fullPath).isFile(), `Source must be a file inside the repository: ${path}`);
  }
  const resolvedTalks = talks.map(talk => {
    required(typeof talk.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(talk.id) && !ids.has(talk.id), `Invalid or duplicate talk id: ${talk.id}`);
    ids.add(talk.id);
    required(text(talk.title), `Missing title: ${talk.id}`);
    required(typeof talk.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(talk.date) && !Number.isNaN(Date.parse(talk.date)) && new Date(talk.date).toISOString().slice(0, 10) === talk.date, `Invalid date: ${talk.id}`);
    required(text(talk.event), `Invalid event: ${talk.id}`);
    required(talk.slides === undefined || typeof talk.slides === 'boolean', `slides must be a boolean: ${talk.id}`);
    const stem = `${talk.date.slice(0, 4)}/${talk.date}-${talk.id}`;
    const pdf = `${stem}.pdf`;
    const slides = talk.slides === true ? `${stem}/slides.md` : undefined;
    if (slides) {
      source(slides, '.md');
    }
    source(pdf, '.pdf');
    return { ...talk, pdf, slides };
  });
  return { site, talks: resolvedTalks.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)) };
}

export function loadCatalog(directory = root) {
  return validateCatalog(parse(readFileSync(resolve(directory, 'tooling/site/talks.yaml'), 'utf8')), directory);
}

export function renderIndex({ site, talks }) {
  const e = escapeHtml;
  const years = [...new Set(talks.map(talk => talk.date.slice(0, 4)))];
  const sections = years.map(year => {
    const entries = talks.filter(talk => talk.date.startsWith(year));
    return `<section class="year" aria-labelledby="year-${year}">
      <div class="year-heading"><h2 id="year-${year}">${year}</h2><span>${entries.length}개 발표</span></div>
      <ul class="talks">${entries.map(talk => `<li class="talk">
        <time datetime="${talk.date}">${talk.date.slice(5).replace('-', '.')}</time>
        <div class="talk-content"><h3>${e(talk.title)}</h3>${talk.event ? `<p>${e(talk.event)}</p>` : ''}</div>
        <div class="links">${talk.slides ? `<a class="primary" href="${site.base}${encodePath(deckPath(talk))}" aria-label="${e(talk.title)} 슬라이드 보기">슬라이드 보기 <span aria-hidden="true">↗</span></a>` : ''}${talk.pdf ? `<a href="${site.base}${encodePath(talk.pdf)}" aria-label="${e(talk.title)} PDF">PDF <span aria-hidden="true">↗</span></a>` : ''}</div>
      </li>`).join('\n')}</ul>
    </section>`;
  }).join('\n');
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${e(site.description)}">
  <meta name="theme-color" content="#142d49">
  <title>${e(site.title)}</title>
  <link rel="stylesheet" href="${site.base}site.css">
</head>
<body>
  <a class="skip" href="#talks">발표 목록으로 이동</a>
  <header class="masthead"><div class="wrap"><a class="brand" href="${site.base}">jmnote<span> / talks</span></a><a href="${e(site.repository)}">GitHub ↗</a></div></header>
  <main class="wrap">
    <div class="intro"><p class="eyebrow">발표 아카이브 · ${talks.length}개 발표</p><h1>발표 자료</h1><p>${e(site.description)}</p></div>
    <div id="talks">${sections}</div>
  </main>
  <footer class="wrap footer">발표 슬라이드와 PDF 아카이브.<a href="${e(site.repository)}">원본 저장소 ↗</a></footer>
</body>
</html>
`;
}

export function renderReadmeTable({ talks }) {
  const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
  return ['| 날짜 | 발표 | 자료 |', '|---|---|---|', ...talks.map(talk => {
    const links = [];
    if (talk.slides) links.push(`[Slidev 원본](${encodePath(talk.slides)})`);
    if (talk.pdf) links.push(`[PDF](${encodePath(talk.pdf)})`);
    return `| ${talk.date} | ${cell(talk.title)} | ${links.join(' · ')} |`;
  })].join('\n');
}
