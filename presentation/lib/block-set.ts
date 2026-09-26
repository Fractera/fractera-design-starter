// НАБОР БЛОКОВ ЭТОГО ЭЛЕМЕНТА — одно место (шаг 299). Блоки пришли из реестра «Блоков» (`npx shadcn add @fractera/<блок>`)
// и живут копией в `components/blocks/`. Главная и шаблон дерева страниц рисуют ОДНИМ набором: вид блока в
// `content/**/<lang>.json` (`"kind": "cards"`) — это ключ отсюда. Нужен новый вид — поставь блок из реестра и допиши строку.
import type { BlockSet } from '@/components/blocks/page-body'
import { Metrics } from '@/components/blocks/metrics'
import { Badges } from '@/components/blocks/badges'
import { Cards } from '@/components/blocks/cards'
import { Card } from '@/components/blocks/card'
import { Flow } from '@/components/blocks/flow'
import { H3 } from '@/components/blocks/h3'
import { P } from '@/components/blocks/p'
import { Faq } from '@/components/blocks/faq'
import { FeatureSwitches, SettingsView, SettingsEditor, MenuEditor, RoutingEditorBlock, CookieBannerBlock, LanguagesBlock } from '@/components/settings/blocks'

export const BLOCK_SET: BlockSet = { metrics: Metrics, badges: Badges, cards: Cards, card: Card, flow: Flow, h3: H3, p: P, faq: Faq, featureSwitches: FeatureSwitches, settingsView: SettingsView, settingsEditor: SettingsEditor, menuEditor: MenuEditor, routingEditor: RoutingEditorBlock, cookieBannerEditor: CookieBannerBlock, languagesEditor: LanguagesBlock }
