'use client'

// ЛЕВОЕ МЕНЮ РАЗДЕЛОВ ВЕТКИ АРХИТЕКТОРА (узел, шаг 564). Слово владельца 2026-10-21: «если страницы реально существует а у нас нет
// только перехода между ними тогда просто сделай на этой странице … левое меню чтобы мы переключались». Пункты собирает сервер
// (`layout.tsx`) из папок `_pages/` — второго списка разделов нет; здесь только отметка «вы здесь» по адресу браузера.
// Ссылки стоят в HTML (островок рисуется и на сервере); на телефоне меню — строка над страницей с прокруткой вбок.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export type SectionItem = { href: string; label: string }

export function SectionMenu({ items, title }: { items: SectionItem[]; title: string }) {
  const path = (usePathname() ?? '').replace(/\/+$/, '')
  return (
    <nav aria-label={title} data-block="smn64" className="border-b border-border md:sticky md:top-14 md:max-h-[calc(100vh-3.5rem)] md:w-60 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r">
      <p className="hidden px-4 pt-6 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">{title}</p>
      <ul className="flex gap-1 overflow-x-auto px-4 py-2 md:flex-col md:overflow-visible md:pb-6">
        {items.map((it) => {
          const here = path === it.href
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                aria-current={here ? 'page' : undefined}
                className={cn(
                  'block whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                  here ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground',
                )}
              >
                {it.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
