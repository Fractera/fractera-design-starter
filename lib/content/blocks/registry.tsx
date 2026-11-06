import type { ReactNode } from 'react'
import { PageBody, type BlockSet } from '@/components/blocks/page-body'
import { SectionHead } from '@/components/blocks/block-section-head'
import { HeroCentered } from '@/components/blocks/block-hero-centered'
import { WarningCard } from '@/components/blocks/block-warning-card'
import { Faq } from '@/components/blocks/block-faq'
// 662-7 (владелец 2026-11-06: «посмотри какие форматы из секции блоки можно было бы перенести в секцию дизайн»): карточки, схема в три
// шага и крупные цифры — те же блоки каталога, что у «Блоков» и графа.
import { Cards } from '@/components/blocks/block-cards'
import { Card } from '@/components/blocks/block-card'
import { Flow } from '@/components/blocks/block-flow'
import { Metrics } from '@/components/blocks/block-metrics'
import type { Block } from './types'
import { TEXT_SET } from '@/lib/content/text-set'

// НАБОР БЛОКОВ ЭТОГО ЭЛЕМЕНТА И ОТРИСОВКА СТРАНИЦЫ (шаг 314-2).
//
// 🔒 РИСУЕТ ФАБРИКА `page-body` ИЗ «БЛОКОВ», А НЕ СВОЙ КАТАЛОГ. Здесь только набор — какие блоки стоят в проекте. Новый
// блок: `npx shadcn add @fractera/<имя>` → строка в наборе → вид в `types.ts`. Вид без строки — ошибка сборки
// с командой установки, а не пустое место на странице.
// 🪦 Прежняя отрисовка через `sections/` (62 вида) удалена вместе с каталогом.

export const BLOCK_SET: BlockSet = {
  'block-section-head': SectionHead,
  'block-hero-centered': HeroCentered,
  'block-warning-card': WarningCard,
  'block-faq': Faq,
  'block-cards': Cards,
  'block-card': Card,
  'block-flow': Flow,
  'block-metrics': Metrics,
}

/** Нарисовать список блоков по порядку; `keyPrefix` держит ключи уникальными между вызовами на одной странице. */
/** 423: страница — последовательность трёх видов: `block-*` (набор выше), `text-*` (типографика элемента), `widget-*` (виджеты
 *  ветки — `widgets`, уже привязанные к языку). Незнакомое имя — громкая ошибка фабрики, а не пустое место. */
export function renderBlocks(blocks: (Block | { kind: 'block-faq'; title: string; items: { q: string; a: string }[] })[], keyPrefix = 'blk', widgets?: BlockSet): ReactNode {
  return <PageBody key={keyPrefix} blocks={blocks} set={{ ...BLOCK_SET, ...TEXT_SET, ...(widgets ?? {}) }} />
}
