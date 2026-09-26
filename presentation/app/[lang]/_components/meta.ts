import type { Metadata } from 'next'
import { configHomeWords, LANGS } from '../_data/body'

// Адрес элемента для поисковика. 🛑 canonical и hreflang — только когда адрес настоящий: ссылка на петлю машины
// (`127.0.0.1`, `localhost`) была бы ложью поисковику, и в день смены адреса — битой.
const PUBLIC = (process.env.SERVICE_PUBLIC_URL ?? '').replace(/\/+$/, '')
export const PUBLIC_BASE = /^https:\/\//.test(PUBLIC) && !/localhost|127\.0\.0\.1/.test(PUBLIC) ? PUBLIC : ''

// 🛑 ПОКА НЕ В ПОИСКЕ: текст лендинга переписан в 299-6 по слову владельца (CONFIG — дополнение, MCP) и открывается поиску
// только после его одобрения (федеральный закон о публичных текстах).
const INDEXED = false

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const w = configHomeWords(lang)
  const url = PUBLIC_BASE ? `${PUBLIC_BASE}/${lang}` : undefined
  return {
    title: w.title,
    description: w.description,
    robots: { index: INDEXED, follow: INDEXED },
    ...(PUBLIC_BASE && INDEXED
      ? {
          metadataBase: new URL(PUBLIC_BASE),
          alternates: {
            canonical: url,
            languages: { ...Object.fromEntries(LANGS.map((l) => [l, `${PUBLIC_BASE}/${l}`])), 'x-default': `${PUBLIC_BASE}/en` },
          },
        }
      : {}),
    openGraph: { title: w.title, description: w.description, ...(url ? { url } : {}), locale: lang, type: 'website' },
  }
}
