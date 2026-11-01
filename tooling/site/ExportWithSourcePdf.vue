<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { configs } from '@slidev/client'
import Export from '@slidev/client/pages/export.vue'

// 헤드매터 `sourcePdf`: 발표 원본 PDF 경로 (덱 URL 기준 상대 경로)
const sourcePdf = (configs as Record<string, unknown>).sourcePdf as string | undefined
const fileName = sourcePdf?.split('/').pop()
const slot = document.createElement('div')
const mounted = ref(false)
let observer: MutationObserver | undefined

// Browser Exporter 우측 버튼 열의 첫 카드(Export as Vector File) 앞에 끼워 넣는다.
function attach() {
  if (slot.isConnected)
    return
  const heading = [...document.querySelectorAll('h2')].find(h => h.textContent?.trim() === 'Export as Vector File')
  const card = heading?.closest('[border]')
  card?.parentElement?.insertBefore(slot, card)
}

onMounted(() => {
  if (!sourcePdf)
    return
  attach()
  mounted.value = true
  observer = new MutationObserver(attach)
  observer.observe(document.body, { childList: true, subtree: true })
})
onBeforeUnmount(() => {
  observer?.disconnect()
  slot.remove()
})
</script>

<template>
  <Export />
  <Teleport v-if="mounted" :to="slot">
    <div border="~ main rounded-lg" p3 flex="~ col gap-2">
      <h2>Download Published PDF <sup op50 italic text-sm>Recommended</sup></h2>
      <div class="flex flex-col gap-2 min-w-max">
        <a class="slidev-form-button source-pdf-button" :href="sourcePdf" :download="fileName">
          PDF
        </a>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.source-pdf-button { text-align: center; text-decoration: none; }
</style>
