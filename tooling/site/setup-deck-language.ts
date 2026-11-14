import type { Router } from 'vue-router'
import { configs } from '@slidev/client'

// 언어별 덱 URL이 문서 언어를 정한다. 정적 호스팅은 /<n> 직접 진입을 지원하지 않으므로
// 언어 전환은 덱 base에 ?slide=<n>을 붙여 열고, 여기서 해당 슬라이드로 옮긴 뒤 주소에서 지운다.
export default function setupDeckLanguage(router?: Router) {
  const language = (configs as Record<string, unknown>).language
  if (language === 'ko' || language === 'en') document.documentElement.lang = language
  const slide = new URL(location.href).searchParams.get('slide')
  if (!router || !slide || !/^\d+$/.test(slide)) return
  router.isReady().then(async () => {
    const { slide: _, ...query } = router.currentRoute.value.query
    await router.replace({ path: `/${slide}`, query })
    const url = new URL(location.href)
    if (url.searchParams.has('slide')) {
      url.searchParams.delete('slide')
      history.replaceState(history.state, '', url.href)
    }
  })
}
