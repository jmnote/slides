import { readFileSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
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
  required(typeof site.origin === 'string' && /^https:\/\/[^/\s?#]+$/.test(site.origin), 'site.origin must be an HTTPS origin without a trailing slash');
  const ids = new Set();
  function source(path, extension, talk) {
    required(typeof path === 'string' && /^(?:pdf\/)?\d{4}-\d{2}-\d{2}-/.test(path) && !path.includes('\\') && !path.split('/').some(part => !part || part === '.' || part === '..') && path.endsWith(extension), `Invalid source path: ${path}`);
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
    required(talk.id !== 'pdf', `Reserved talk id (PDF directory): ${talk.id}`);
    ids.add(talk.id);
    required(text(talk.title), `Missing title: ${talk.id}`);
    required(typeof talk.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(talk.date) && !Number.isNaN(Date.parse(talk.date)) && new Date(talk.date).toISOString().slice(0, 10) === talk.date, `Invalid date: ${talk.id}`);
    required(text(talk.event), `Invalid event: ${talk.id}`);
    required(talk.slides === undefined || typeof talk.slides === 'boolean', `slides must be a boolean: ${talk.id}`);
    const stem = `${talk.date}-${talk.id}`;
    const pdf = `pdf/${stem}.pdf`;
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

// Shares assets/style.css, assets/theme.js and the nav with the profile page (index.html at the repo root).
export function renderIndex({ site, talks }) {
  const e = escapeHtml;
  const years = [...new Set(talks.map(talk => talk.date.slice(0, 4)))];
  const sections = years.map(year => {
    const entries = talks.filter(talk => talk.date.startsWith(year));
    return `    <h2 id="year-${year}">${year}</h2>
    <table class="talks-table">
      <thead>
        <tr><th scope="col">Title</th><th scope="col">Event</th><th scope="col">Date</th><th scope="col">Links</th></tr>
      </thead>
      <tbody>
${entries.map(talk => `        <tr><td>${e(talk.title)}</td><td>${e(talk.event)}</td><td><time datetime="${talk.date}">${talk.date}</time></td><td>${talk.slides ? `<a href="${site.base}${encodePath(deckPath(talk))}" aria-label="${e(talk.title)} slides">Slides</a> · ` : ''}<a href="${site.base}${encodePath(talk.pdf)}" aria-label="${e(talk.title)} PDF">PDF</a></td></tr>`).join('\n')}
      </tbody>
    </table>`;
  }).join('\n\n');
  return `<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e(site.title)}</title>
  <meta name="description" content="${e(site.description)}">
  <link rel="canonical" href="${e(site.origin)}${site.base}">
  <link rel="icon" href="https://github.com/jmnote.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=PT+Sans&family=Source+Sans+Pro&family=Roboto+Mono&display=swap">
  <script>
    const savedTheme = localStorage.getItem('DARK_LIGHT_THEME');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = savedTheme || preferredTheme;
  </script>
  <link rel="stylesheet" href="/assets/style.css">
</head>

<body>
  <main class="markdown-section">
    <button id="theme-toggle" type="button" aria-label="Switch theme" title="Switch theme">
      <img id="theme-icon" src="/assets/sun.svg" alt="">
    </button>
    <nav class="site-nav" aria-label="Site">
      <a href="/">Home</a>
      <a href="${site.base}" aria-current="page">Slides</a>
      <a href="https://github.com/jmnote">GitHub</a>
    </nav>
    <h1>Slides</h1>
    <p>${e(site.description)}</p>

${sections}
  </main>

  <footer class="site-footer">
    Design adapted from
    <a href="https://github.com/boopathikumar018/docsify-darklight-theme" target="_blank" rel="noopener">docsify-darklight-theme</a>.
    <a href="${e(site.repository)}">Source</a>.
  </footer>

  <script src="/assets/theme.js"></script>
</body>

</html>
`;
}

export function renderReadmeTable({ site, talks }) {
  const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
  return ['| 제목 | 웹 | PDF | 날짜 | 행사 |', '| --- | :---: | :---: | --- | --- |', ...talks.map(talk => {
    const web = talk.slides
      ? `[<img src="tooling/site/icons/globe.svg" width="20" height="20" alt="웹에서 보기">](${site.origin}${site.base}${encodePath(deckPath(talk))})`
      : '—';
    const pdf = `[<img src="tooling/site/icons/file-pdf.svg" width="20" height="20" alt="PDF 다운로드">](${encodePath(talk.pdf)}?raw=true)`;
    return `| ${cell(talk.title)} | ${web} | ${pdf} | ${talk.date} | ${cell(talk.event)} |`;
  })].join('\n');
}
