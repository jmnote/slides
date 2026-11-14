import type { Router } from 'vue-router'
import setupDeckLanguage from './setup-deck-language'
import setupClassLabels from './class-labels'
import setupSectionNumbers from './section-numbers'

// 덱별 setup/main.ts가 불러오는 공통 앱 설정
export default function setupMain({ router }: { router?: Router } = {}) {
  setupDeckLanguage(router)
  setupSectionNumbers()
  setupClassLabels()
}
