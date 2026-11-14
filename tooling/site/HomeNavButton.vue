<script setup lang="ts">
import { configs, useNav } from '@slidev/client'
import IconButton from '@slidev/client/internals/IconButton.vue'
import { isScreenVertical } from '@slidev/client/state/storage.ts'
import { deckBaseFor, slidesBase } from './site-base'

const config = configs as Record<string, unknown>
const languages = Array.isArray(config.languages) ? config.languages as string[] : []
const deckLanguage = config.language === 'en' ? 'en' : 'ko'
const canSwitch = languages.includes('ko') && languages.includes('en') && deckBaseFor(deckLanguage) !== undefined
// 같은 슬라이드 번호로 다른 언어 덱을 연다(setup-deck-language가 ?slide를 처리). 목록과 같은 선호 언어 키에 선택을 남긴다.
const switchLanguage = (language: string) => {
  try { localStorage.setItem('jmnote.language', language) } catch { /* Storage may be disabled. */ }
  const slide = location.pathname.match(/\/(\d+)\/?$/)?.[1] ?? location.hash.match(/^#\/(\d+)/)?.[1]
  location.assign(`${deckBaseFor(language)}${slide ? `?slide=${slide}` : ''}`)
}
const { isPresenter, isEmbedded } = useNav()
// 홈 버튼은 같은 언어의 슬라이드 목록(/<언어>/slides/)으로 간다.
const home = slidesBase
const homeTitle = deckLanguage === 'en' ? 'Slides' : '슬라이드 목록'
</script>

<template>
  <div v-if="!isPresenter && !isEmbedded" class="home-nav" :class="{ persist: isScreenVertical }">
    <details v-if="canSwitch" class="language-picker">
      <summary class="slidev-icon-btn language-trigger" aria-label="Language" title="Language">
        <svg class="language-icon home-icon" viewBox="0 0 32 32" aria-hidden="true">
          <text x="-1" y="19" font-family="Noto Sans KR, sans-serif" style="font-size: 21px" fill="currentColor">가</text>
          <path transform="translate(-6 -5) scale(1.25)" fill="currentColor" d="M27.85 29H30l-6-15h-2.35l-6 15h2.15l1.6-4h6.85Zm-7.65-6l2.62-6.56L25.45 23Z" />
        </svg>
      </summary>
      <div class="language-menu">
        <button type="button" :aria-current="deckLanguage === 'en' ? 'true' : undefined" @click="switchLanguage('en')">English</button>
        <button type="button" :aria-current="deckLanguage === 'ko' ? 'true' : undefined" @click="switchLanguage('ko')">한국어</button>
      </div>
    </details>
    <IconButton as="a" :href="home" :title="homeTitle">
      <div class="i-carbon:home home-icon" />
    </IconButton>
  </div>
</template>

<style scoped>
/* 컨트롤 바 버튼과 같은 높이·여백: 바 바깥 여백 8px + 테두리 1px + 바 안쪽 여백(4px, lg 8px) */
.home-nav {
  --gap: 13px;
  position: fixed;
  right: var(--gap);
  bottom: var(--gap);
  display: flex;
  font-size: 1.25rem;
  line-height: 1.75rem;
  color: #ffffff;
}
.home-nav.persist { --gap: 4px; }
.language-picker { position: relative; }
.language-icon { display: block; width: 20px; height: 20px; }
.language-trigger { display: flex; align-items: center; justify-content: center; list-style: none; cursor: pointer; }
.language-trigger::-webkit-details-marker { display: none; }
.language-menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  min-width: 112px;
  padding: 4px;
  border: 1px solid #8ba8ca;
  border-radius: 8px;
  background: #142d49;
  box-shadow: 0 2px 12px #0004;
}
.language-menu button {
  width: 100%;
  padding: 6px 10px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #f4f8ff;
  display: flex;
  justify-content: space-between;
  text-align: left;
  font-family: "Noto Sans KR", sans-serif;
  font-size: 12px;
  cursor: pointer;
}
.language-menu button:hover, .language-menu button:focus-visible { background: #475569; }
.language-menu button[aria-current] { background: #315578; font-weight: 700; }
@media (min-width: 1024px) {
  .home-nav { --gap: 17px; }
  .home-nav.persist { --gap: 8px; }
}
.home-icon {
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.9)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
}
.home-nav :deep(.slidev-icon-btn:hover),
.home-nav :deep(.slidev-icon-btn:focus-visible) { background: rgba(20, 45, 73, 0.75); }
.home-nav :deep(.slidev-icon-btn:hover) .home-icon { filter: none; }
</style>
