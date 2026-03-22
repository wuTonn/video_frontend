import type { ReactNode } from 'react'
import './styles/globals.css'

/** 原 Next.js `metadata` 中的站点信息，可在其它模块引用；静态 head 见 `index.html`。 */
export const siteConfig = {
  title: 'Multimodal AI Video Analyzer',
  description:
    'AI-powered video content analysis platform for speech recognition, speaker identification, emotion analysis, and keyframe extraction',
  generator: 'v0.app',
} as const

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

/**
 * Vite/React 下的根布局：`html` / `body` 在 `index.html` 中，此处只包裹应用根节点。
 * 字体由 `globals.css` 中 `--font-sans` 等主题变量定义（可按需在 `index.html` 引入 Geist）。
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return <div className="font-sans antialiased min-h-dvh">{children}</div>
}
