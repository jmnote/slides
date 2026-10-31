<script setup lang="ts">
</script>

<template>
  <footer
    v-if="$slidev.nav.currentPage > 1"
    class="template-footer"
  >
    <span class="left">Template Showcase</span>
    <span class="right">{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
  </footer>
</template>

<style scoped>
.template-footer {
  position: absolute;
  bottom: 12px;
  left: 54px;
  right: 54px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #8fa0b5;
  pointer-events: none;
  z-index: 50;
}
</style>
