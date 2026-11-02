// make site 게이트웨이의 요청 파싱. 잘못된 입력은 예외 대신 null을 돌려준다.
export function requestPath(url) {
  try {
    return decodeURIComponent(String(url).split('?')[0]);
  } catch {
    return null;
  }
}

export function refererPath(referer) {
  try {
    return new URL(referer || '/', 'http://x').pathname;
  } catch {
    return '/';
  }
}
