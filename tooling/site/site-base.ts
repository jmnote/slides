// 덱 base(<site>/<언어>/slides/<id>/)에서 같은 언어의 슬라이드 목록(<site>/<언어>/slides/)을 구한다.
// 단독 개발(`make dev`, base `/`)에서는 `/`. 브라우저의 현재 경로 깊이와 무관하므로 exporter 하위 경로에서도 같은 값이다.
export const slidesBase = import.meta.env.BASE_URL.replace(/[^/]+\/$/, '')

// 언어별 덱 base에서 다른 언어 덱의 base를 구한다. 언어별 경로가 아니면 undefined.
export const deckBaseFor = (language: string) => {
  const match = import.meta.env.BASE_URL.match(/^(.*\/)(?:ko|en)(\/slides\/[^/]+\/)$/)
  return match ? `${match[1]}${language}${match[2]}` : undefined
}
