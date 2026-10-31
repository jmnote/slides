<template>
  <footer v-if="$slidev.nav.currentPage > 2 && $slidev.nav.currentSlide?.frontmatter?.class !== 'section'" class="deck-footer">
    <span>Cloud Native & Samsung Cloud Platform · 2023.07.12</span>
    <span>{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
  </footer>
</template>

<style scoped>
.deck-footer {
  position: absolute;
  bottom: 16px;
  left: 54px;
  right: 54px;
  display: flex;
  justify-content: space-between;
  color: #71849d;
  font: 14px 'Noto Sans KR', sans-serif;
  pointer-events: none;
}
</style>
