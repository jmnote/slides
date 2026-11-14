// 홈·루트·sitemap·robots 페이지. 슬라이드 목록은 catalog.mjs의 renderIndex가 만든다.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { root, escapeHtml, encodePath, LANGUAGES, slidesPath, deckPath, pdfPath, renderPage } from './catalog.mjs';

const required = (condition, message) => { if (!condition) throw new Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const bilingual = value => text(value?.en) && text(value?.ko);

// 홈 내용(tooling/site/home.yaml)을 검증하고 저장소를 그룹 안에서 이름순으로 정렬한다.
export function validateHome(data) {
  required(text(data?.title) && bilingual(data.greeting) && bilingual(data.bio), 'home.yaml: title, greeting.en/ko, bio.en/ko are required');
  required(Array.isArray(data.groups) && data.groups.length, 'home.yaml: groups must be a non-empty list');
  const groups = data.groups.map(group => {
    required(/^[A-Za-z0-9-]+$/.test(group?.owner ?? ''), `home.yaml: invalid group owner: ${group?.owner}`);
    required(Array.isArray(group.repos) && group.repos.length, `home.yaml: ${group.owner} has no repos`);
    for (const repo of group.repos)
      required(text(repo?.name) && /^[A-Za-z0-9._-]+$/.test(repo?.repo ?? '') && bilingual(repo.description), `home.yaml: ${group.owner} repo needs name, repo, description.en/ko: ${repo?.repo}`);
    const repos = [...group.repos].sort((a, b) => a.repo.toLowerCase().localeCompare(b.repo.toLowerCase()));
    return { ...group, repos };
  });
  return { ...data, groups };
}

export const loadHome = (directory = root) => validateHome(parse(readFileSync(resolve(directory, 'tooling/site/home.yaml'), 'utf8')));

export function renderHome(site, language, home = loadHome()) {
  const e = escapeHtml;
  const t = (en, ko) => language === 'en' ? en : ko;
  const github = path => `https://github.com/${encodePath(path)}`;
  const groups = home.groups.map(group => `        <h3 class="group-title"><a href="${github(group.owner)}">${e(group.owner)}</a></h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th scope="col" class="col-repo">${t('Repo', '저장소')}</th><th scope="col" class="col-desc">${t('Description', '설명')}</th></tr>
            </thead>
            <tbody>
${group.repos.map(repo => `              <tr><td class="col-repo"><a href="${github(`${group.owner}/${repo.repo}`)}">${e(repo.name)}</a></td><td class="col-desc">${e(repo.description[language])}</td></tr>`).join('\n')}
            </tbody>
          </table>
        </div>`).join('\n\n');
  const main = `    <main>
      <section class="hero">
        <img class="avatar" src="https://github.com/jmnote.png?size=160" alt="${e(t("Jmnote's profile image", 'Jmnote 프로필 이미지'))}">
        <div class="hero-bio">
          <h1>${e(home.greeting[language])}</h1>
          <p>${e(home.bio[language])}</p>
        </div>
      </section>

      <section>
        <h2 class="section-title">${t('Repos', '저장소')}</h2>

${groups}
      </section>
    </main>`;
  return renderPage({
    site, language, page: '', main,
    title: home.title,
    description: home.bio[language],
    footer: `<a href="${e(site.repository)}/blob/main/LICENSE" target="_blank" rel="noopener">Apache-2.0</a> &middot; <a href="https://github.com/jmnote" target="_blank" rel="noopener">GitHub</a>`,
    xDefault: `${site.origin}${site.base}`,
  });
}

// 루트는 언어를 고르는 x-default 페이지다. 저장된 선택 → 브라우저 언어 → 영어 순으로 고르고,
// JS가 없으면 두 언어 링크만 보여 준다.
export function renderRoot(site) {
  const home = lang => `${site.base}${lang}/`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Jmnote</title>
  <link rel="canonical" href="${site.origin}${site.base}">
  ${LANGUAGES.map(lang => `<link rel="alternate" hreflang="${lang}" href="${site.origin}${home(lang)}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${site.origin}${site.base}">
  <link rel="icon" href="https://github.com/jmnote.png" type="image/png">
  <script src="${site.base}assets/language.js"></script>
  <script>location.replace(${JSON.stringify(site.base)} + jmnoteLanguage.preferred() + '/');</script>
</head>
<body>
  <p><a href="${home('en')}" hreflang="en" lang="en" data-language="en">English</a> &middot; <a href="${home('ko')}" hreflang="ko" lang="ko" data-language="ko">한국어</a></p>
</body>
</html>
`;
}

export function renderSitemap({ site, talks }) {
  const url = (path, lastmod) => `  <url>\n    <loc>${escapeHtml(`${site.origin}${site.base}${encodePath(path)}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
  const decks = talks.filter(talk => talk.slides).flatMap(talk => [
    url(deckPath(talk, 'ko')),
    ...(talk.slidesEn ? [url(deckPath(talk, 'en'))] : []),
  ]);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
    ...LANGUAGES.flatMap(lang => [url(`${lang}/`), url(slidesPath(lang))]),
    ...decks,
    ...talks.map(talk => url(pdfPath(talk), talk.date)),
  ].join('\n')}
</urlset>
`;
}

export const renderRobots = site => `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}${site.base}sitemap.xml\n`;
