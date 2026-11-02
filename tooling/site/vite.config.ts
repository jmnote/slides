import { createReadStream, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))

// 마크다운 아이콘 단축 표기: `:github: jmnote` → GitHub 아이콘 + 텍스트 (Slidev 렌더링에만 적용, 아이콘 모양은 slide-base.css)
const ICON_SHORTCODES = ['github']

function iconShortcodes(md: any) {
  md.inline.ruler.before('emphasis', 'icon_shortcode', (state: any, silent: boolean) => {
    const match = /^:([a-z0-9-]+):/.exec(state.src.slice(state.pos))
    if (!match || !ICON_SHORTCODES.includes(match[1]))
      return false
    if (!silent) {
      const token = state.push('html_inline', '', 0)
      token.content = `<span class="icon icon-${match[1]}" role="img" aria-label="${match[1]}"></span>`
    }
    state.pos += match[0].length
    return true
  })
}

// 단독 개발(`make dev`)에서도 발표 PDF(/2026/<id>.pdf)를 사이트와 같은 경로로 제공한다.
// 없는 파일은 건드리지 않아 Slidev가 평소처럼 처리한다.
function servePublishedPdf() {
  return {
    name: 'serve-published-pdf',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: () => void) => {
        const match = /^\/(\d{4}\/[^/?#]+\.pdf)(?:\?.*)?$/.exec(req.url ?? '')
        let name: string | undefined
        try {
          name = match && decodeURIComponent(match[1])
        }
        catch {}
        const file = name && !name.includes('..') ? repoRoot + name : undefined
        if (!file || !existsSync(file))
          return next()
        res.setHeader('content-type', 'application/pdf')
        createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [servePublishedPdf()],
  // 덱 폴더 밖의 공통 자산(tooling/site: 표지 배경, 프로필 사진, 아이콘)을 개발 서버가 서빙하도록 허용
  server: { fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] } },
  // Slidev 마크다운 확장 (slidev.markdown → unplugin-vue-markdown 옵션)
  slidev: { markdown: { markdownSetup: (md: any) => md.use(iconShortcodes) } },
} as any)
