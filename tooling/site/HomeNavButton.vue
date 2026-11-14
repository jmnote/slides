<script setup lang="ts">
import { useNav } from '@slidev/client'
import IconButton from '@slidev/client/internals/IconButton.vue'
import { isScreenVertical } from '@slidev/client/state/storage.ts'
import { siteBase } from './site-base'

const { isPresenter, isEmbedded } = useNav()
// 목록에서 공통 선호 언어를 적용한다.
const lang = new URLSearchParams(window.location.search).get('lang')
const home = siteBase + (lang === 'ko' || lang === 'en' ? `?lang=${lang}` : '')
</script>

<template>
  <div v-if="!isPresenter && !isEmbedded" class="home-nav" :class="{ persist: isScreenVertical }">
    <IconButton as="a" :href="home" title="슬라이드 목록">
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
