import setupClassLabels from './class-labels'
import setupSectionNumbers from './section-numbers'

// 덱별 setup/main.ts가 불러오는 공통 앱 설정
export default function setupMain() {
  setupSectionNumbers()
  setupClassLabels()
}
