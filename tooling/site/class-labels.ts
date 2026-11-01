import { watchEffect } from 'vue'
import { configs } from '@slidev/client'
import { slides } from '#slidev/slides'

// 헤드매터 showClassName: true → class가 지정된 슬라이드 오른쪽 위에 `class: 이름` 라벨 (모양은 slide-base.css)
export default function setupClassLabels() {
  if (typeof document === 'undefined' || !(configs as Record<string, unknown>).showClassName)
    return
  const style = document.createElement('style')
  style.dataset.classLabels = ''
  document.head.appendChild(style)
  watchEffect(() => {
    style.textContent = slides.value
      .map(route => ({ no: route.no, name: String(route.meta?.slide?.frontmatter?.class ?? '').trim() }))
      .filter(({ name }) => name)
      .map(({ no, name }) => `[data-slidev-no="${no}"] .slidev-layout::after { content: "class: ${name.replace(/"/g, '')}"; }`)
      .join('\n')
  })
}
