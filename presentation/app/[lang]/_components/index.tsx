import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HeroCentered } from '@/components/blocks/hero-centered'
import { buttonVariants } from '@/components/ui/button'
import { PageBody, type BlockData } from '@/components/blocks/page-body'
import { BLOCK_SET } from '@/lib/block-set'
import { Faq } from '@/components/blocks/faq'
import { configHomeWords, LANGS, type ConfigHomeWords } from '../_data/body'

// ПУБЛИЧНАЯ ГЛАВНАЯ ЭЛЕМЕНТА «НАСТРОЙКИ ПРОЕКТА» (шаг 299). Собрана из блоков реестра «Блоков» — они пришли сюда командой
// `npx shadcn add @fractera/<блок>` (реестр назван в `components.json` через FRACTERA_BLOCKS_URL) и живут своей копией в
// `presentation/components/blocks/`. Главное действие страницы — «Перейти к настройкам»: вход в режим архитектора (299-4).
// 🛑 СЛОВА ОТСЮДА НЕ ПИШУТСЯ — `../_data/body.ts`.

// Секции страницы по отдельности: после каждой секции с заголовком — та же кнопка «Перейти к настройкам», что наверху
// (слово владельца: «Установи эту кнопку после каждой секции слева»). Ряд цифр и ярлыки идут сразу под верхней кнопкой
// и своей кнопки не получают — она стояла бы в двух строках от первой.
function lead(w: ConfigHomeWords): BlockData[] {
  return [
    { kind: 'metrics', items: w.metrics },
    { kind: 'badges', items: w.badges.map((label) => ({ label, tone: 'code' })) },
  ]
}
function groups(w: ConfigHomeWords): BlockData[] {
  return [{
    kind: 'cards', badge: w.groups.badge, title: w.groups.title, note: w.groups.note, cols: 2,
    children: w.groups.items.map((i) => ({ kind: 'card', children: [{ kind: 'h3', text: i.title }, { kind: 'p', text: i.text }] })),
  }]
}
function flow(w: ConfigHomeWords): BlockData[] {
  return [{ kind: 'flow', badge: w.flow.badge, title: w.flow.title, note: w.flow.note, steps: w.flow.steps }]
}

function Cta({ lang, text }: { lang: string; text: string }) {
  return (
    <Link href={`/${lang}/architect`} className={buttonVariants({ size: 'lg', className: 'mt-6 self-start' })}>
      {text}
    </Link>
  )
}

export default async function ConfigHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!LANGS.includes(lang)) notFound()
  const w = configHomeWords(lang)
  return (
    // 307: первый экран шире колонки страницы (до 1250px) — стоит вне её; содержимое — в колонке, как было.
    <main data-app-column className="w-full flex-1 pt-10">
      {/* 304-4: первый экран по центру; кнопка «Перейти к настройкам» — его действие. */}
      <HeroCentered pill={w.pill} title={w.heroTitle} description={w.description} cta={{ label: w.cta, href: `/${lang}/architect` }} steps={w.heroSteps} />
      <div className="mx-auto w-full max-w-5xl px-6 pb-10">
      {/* Один вызов на цифры, ярлыки и группы: PageBody нумерует блоки с нуля в каждом вызове, а по номеру строится id
          заголовка секции. Здесь группы — b2, «Как это работает» ниже — b0: одинаковых id на странице нет. */}
      <PageBody blocks={[...lead(w), ...groups(w)]} set={BLOCK_SET} />
      <Cta lang={lang} text={w.cta} />
      <PageBody blocks={flow(w)} set={BLOCK_SET} />
      <Cta lang={lang} text={w.cta} />
      <Faq title={w.faqTitle} items={w.faq} />
      <Cta lang={lang} text={w.cta} />
      </div>
    </main>
  )
}
