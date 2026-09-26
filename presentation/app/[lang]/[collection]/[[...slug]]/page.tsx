// ЕДИНСТВЕННЫЙ ШАБЛОН ВСЕХ СТРАНИЦ ДЕРЕВА (шаг 298). Страница — это папка `content/<коллекция>/<slug>/`, а не файл
// здесь: новый раздел или новая страница НЕ получают своего `page.tsx` (сторож `scripts/check-routes.mjs` уронит
// сборку). `/<lang>/<коллекция>` — оглавление коллекции, `/<lang>/<коллекция>/<slug…>` — страница.
//
// Предрендер — срез из `prerenderSlice` (все языки или `PRERENDER_LANGS`); адрес вне среза рисуется при первом заходе и
// сохраняется (Next 16.2, dynamic-routes.md «With Cache Components»). Страница остаётся статической: у неё свой адрес,
// готовый HTML и canonical/hreflang — динамический здесь только сегмент адреса, а не отрисовка.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageBody, type BlockData } from '@/components/blocks/page-body'
import { BLOCK_SET } from '@/lib/block-set'
import { pageTree, pageWords, collectionWords, prerenderSlice, type TreeCollection } from '@/lib/page-tree'
import { WorkspaceShell, type WorkspaceShellItem } from '@/components/workspace/workspace-shell'
import { Breadcrumbs } from '@/components/blocks/breadcrumbs'
import { PUBLIC_BASE } from '../../_components/meta'
import { LANGS } from '../../_data/body'

type Params = { lang: string; collection: string; slug?: string[] }

export async function generateStaticParams(): Promise<Params[]> {
  const slice = await prerenderSlice(LANGS)
  // Next 16 с Cache Components требует хотя бы один параметр; пустое дерево отвечает 404 по этому образцу.
  return slice.length ? slice : [{ lang: LANGS[0], collection: '__empty__', slug: [] }]
}

async function find(p: Params): Promise<{ c: TreeCollection; slug: string[] } | null> {
  if (!LANGS.includes(p.lang)) return null
  const c = (await pageTree()).find((x) => x.id === p.collection)
  if (!c) return null
  const slug = p.slug ?? []
  if (slug.length && !c.pages.some((x) => x.slug.join('/') === slug.join('/') && x.langs.includes(p.lang))) return null
  return { c, slug }
}

function addressOf(lang: string, collection: string, slug: string[]) {
  return `/${lang}/${collection}${slug.length ? `/${slug.join('/')}` : ''}`
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = await params
  const hit = await find(p)
  if (!hit) return { title: 'Not found', robots: { index: false, follow: false } }
  const { c, slug } = hit
  const page = slug.length ? c.pages.find((x) => x.slug.join('/') === slug.join('/')) : null
  const words = slug.length ? await pageWords(c.id, slug, p.lang) : null
  const title = words?.title ?? c.titles[p.lang] ?? c.titles.en ?? c.id
  const index = page ? page.index : c.index
  // hreflang — только языки, на которых страница ДЕЙСТВИТЕЛЬНО есть: ссылка на несуществующий перевод — ложь поисковику.
  const langs = page ? page.langs : LANGS
  return {
    title,
    description: words?.lead,
    robots: { index, follow: index },
    ...(PUBLIC_BASE && index
      ? {
          metadataBase: new URL(PUBLIC_BASE),
          alternates: {
            canonical: `${PUBLIC_BASE}${addressOf(p.lang, c.id, slug)}`,
            languages: Object.fromEntries(langs.map((l) => [l, `${PUBLIC_BASE}${addressOf(l, c.id, slug)}`])),
          },
        }
      : {}),
  }
}

// РАБОЧИЙ ЭКРАН (299-8) — коллекция объявляет `layout: "workspace"` в `_collection.json`. Устройство — как
// aifa.dev/ru/architect/app-config (слово владельца: «слева … а справа как настраиваем как здесь»): сверху шапка страницы
// (главная коллекции: заголовок и пояснение — «где я»), ниже рабочий экран: меню всех страниц коллекции слева, открытая
// страница справа — «что я открыл». Меню строится из папок коллекции: второго списка разделов нет.
async function WorkspacePage({ c, slug, lang }: { c: TreeCollection; slug: string[]; lang: string }) {
  const head = await collectionWords(c.id, lang)
  const pages = await Promise.all(
    c.pages.filter((x) => x.langs.includes(lang)).map(async (x) => ({ x, w: await pageWords(c.id, x.slug, lang) })),
  )
  const current = slug.length ? pages.find(({ x }) => x.slug.join('/') === slug.join('/')) : null
  if (slug.length && !current?.w) notFound()
  const homeLabel = head?.menuLabel ?? head?.title ?? c.titles[lang] ?? c.id
  const menu: WorkspaceShellItem[] = [
    { label: homeLabel, href: addressOf(lang, c.id, []), active: !slug.length },
    ...pages.map(({ x, w }) => ({
      label: w?.title ?? x.slug.join('/'),
      href: addressOf(lang, c.id, x.slug),
      active: x.slug.join('/') === slug.join('/'),
    })),
  ]
  const blocks = (current ? current.w?.blocks : head?.blocks) ?? []
  const menuWord = c.menuWord?.[lang] ?? c.menuWord?.en ?? 'Menu'
  const pageTitle = head?.title ?? c.titles[lang] ?? c.titles.en ?? c.id
  // Крошки (слово владельца: «хлебные крошки чтобы я мог вернуться обратно на главное или на уровень выше»):
  // публичная главная элемента → главная режима → открытый раздел (без ссылки).
  const crumbs = [
    { label: c.crumbHome?.[lang] ?? c.crumbHome?.en ?? 'Home', href: `/${lang}` },
    { label: pageTitle, href: slug.length ? addressOf(lang, c.id, []) : undefined },
    ...(current?.w ? [{ label: current.w.title }] : []),
  ]
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{pageTitle}</h1>
      {head?.lead && <p className="mt-3 text-lg text-muted-foreground">{head.lead}</p>}
      <WorkspaceShell
        id={c.id}
        menuTitle={c.titles[lang] ?? c.titles.en ?? c.id}
        menuWord={menuWord}
        menu={menu}
        title={current?.w?.title ?? homeLabel}
        lead={current?.w?.lead}
      >
        <PageBody blocks={blocks as unknown as BlockData[]} set={BLOCK_SET} />
      </WorkspaceShell>
    </main>
  )
}

export default async function TreePage({ params }: { params: Promise<Params> }) {
  const p = await params
  const hit = await find(p)
  if (!hit) notFound()
  const { c, slug } = hit

  if (c.layout === 'workspace') return <WorkspacePage c={c} slug={slug} lang={p.lang} />

  if (!slug.length) {
    const items = await Promise.all(
      c.pages
        .filter((x) => x.langs.includes(p.lang))
        .map(async (x) => ({ x, w: await pageWords(c.id, x.slug, p.lang) })),
    )
    // Главная коллекции может нести свои слова и блоки (`_index/<lang>.json`) — над списком страниц.
    const head = await collectionWords(c.id, p.lang)
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{head?.title ?? c.titles[p.lang] ?? c.titles.en ?? c.id}</h1>
        {head?.lead && <p className="mt-3 text-lg text-muted-foreground">{head.lead}</p>}
        {head?.blocks?.length ? (
          <div className="mt-8">
            <PageBody blocks={head.blocks as unknown as BlockData[]} set={BLOCK_SET} />
          </div>
        ) : null}
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map(({ x, w }) => (
            <li key={x.slug.join('/')} className="rounded-xl border border-border bg-card p-4">
              <Link href={addressOf(p.lang, c.id, x.slug)} className="font-medium text-primary hover:underline">
                {w?.title ?? x.slug.join('/')}
              </Link>
              {w?.lead && <p className="mt-1 text-sm text-muted-foreground">{w.lead}</p>}
            </li>
          ))}
        </ul>
      </main>
    )
  }

  const words = await pageWords(c.id, slug, p.lang)
  if (!words) notFound()
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{words.title}</h1>
      {words.lead && <p className="mt-3 text-lg text-muted-foreground">{words.lead}</p>}
      <div className="mt-8">
        <PageBody blocks={(words.blocks ?? []) as unknown as BlockData[]} set={BLOCK_SET} />
      </div>
    </main>
  )
}
