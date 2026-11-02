import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

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

export default defineConfig({
  // 덱 폴더 밖의 공통 자산(tooling/site: 표지 배경, 프로필 사진, 아이콘)을 개발 서버가 서빙하도록 허용
  server: { fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] } },
  // Slidev 마크다운 확장 (slidev.markdown → unplugin-vue-markdown 옵션)
  slidev: { markdown: { markdownSetup: (md: any) => md.use(iconShortcodes) } },
} as any)
