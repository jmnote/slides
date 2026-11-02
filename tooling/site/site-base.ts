// 덱 base(/slides/<id>/)에서 사이트 base(/slides/)를 구한다. 단독 개발(`make dev`)에서는 `/`.
// 브라우저의 현재 경로 깊이와 무관하므로 exporter 하위 경로에서도 같은 값이다.
export const siteBase = import.meta.env.BASE_URL.replace(/[^/]+\/$/, '')
