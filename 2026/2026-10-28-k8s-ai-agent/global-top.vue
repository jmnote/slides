<template>
  <footer class="deck-footer">
    <span>Kubernetes × AI Agent · 2026.10.28</span>
    <span>{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
  </footer>
</template>

<style scoped>
.deck-footer { position: absolute; bottom: 16px; left: 54px; right: 54px; display: flex; justify-content: space-between; color: #71849d; font: 14px 'Noto Sans KR', sans-serif; pointer-events: none; }
</style>
