import { watchEffect } from 'vue'
import { slides } from '#slidev/slides'

// class: section 슬라이드에 순번을 매겨 CSS 카운터(section)로 넘긴다.
// slide-base.css가 이 번호로 `# 제목` 앞에 로마 숫자 배지를 그린다.
const ROMAN: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]

// 배지 안에 들어가도록 로마 숫자 길이에 따라 글자 크기를 줄인다 (1~2글자 56px, 3글자 44px, 4글자 이상 34px)
function badgeFont(n: number) {
  let len = 0
  for (const [value, numeral] of ROMAN) {
    while (n >= value) {
      n -= value
      len += numeral.length
    }
  }
  return len <= 2 ? '56px' : len === 3 ? '44px' : '34px'
}

export default function setupSectionNumbers() {
  if (typeof document === 'undefined')
    return
  const style = document.createElement('style')
  style.dataset.sectionNumbers = ''
  document.head.appendChild(style)
  watchEffect(() => {
    let n = 0
    style.textContent = slides.value
      .filter(route => String(route.meta?.slide?.frontmatter?.class ?? '').split(/\s+/).includes('section'))
      .map((route) => {
        n += 1
        return `[data-slidev-no="${route.no}"] .slidev-layout.section { counter-set: section ${n}; --section-badge-font: ${badgeFont(n)}; }`
      })
      .join('\n')
  })
}
