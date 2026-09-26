// БЛОКИ РЕЖИМА АРХИТЕКТОРА (шаг 299-4): серверные обёртки островков. Ссылку на вход дают отсюда, из окружения узла
// (`PROJECT_SITE_URL`, как у шапки проекта), — данные страницы в `content/**/<lang>.json` адресов узла не знают.
import { FeatureSwitchesIsland, type FeatureSwitchesProps } from './feature-switches.client'
import { SettingsViewIsland, type SettingsViewProps } from './settings-view.client'
import { SettingsEditorIsland, type SettingsEditorProps } from './settings-editor.client'
import { fieldsUi } from './fields.i18n'
import { MenuEditorIsland, type MenuEditorProps } from './menu-editor.client'
import { groupsUi } from './groups.i18n'
import { RoutingEditorIsland, CookieBannerIsland } from './platform-editors.client'
import type { AccessWords } from './settings-access'
import { LanguagesIsland } from './languages-island.client'
import { ALL_LANGUAGE_METADATA } from '@/lib/settings/language-metadata'
import { loadProjectShell } from '@/components/shell/remote-shell'
import type { ShellGroup } from '@/components/shell/shell-types'
import type { NavCandidate, NavItem, NavSlot } from '@/lib/settings/nav'
import { cacheLife } from 'next/cache'

const SITE = (process.env.PROJECT_SITE_URL ?? '').replace(/\/+$/, '')
const loginHref = (lang: string) => (SITE ? `${SITE}/login?lang=${lang}` : undefined)

type Own = { lang: string; blockKey?: string }

export function FeatureSwitches({ lang, blockKey: _k, ...rest }: Omit<FeatureSwitchesProps, 'loginHref'> & Own) {
  return <FeatureSwitchesIsland {...rest} loginHref={loginHref(lang)} />
}

// `kind` у блока занят видом блока, поэтому вид настроек в данных страницы — `settingsKind`.
export function SettingsView({ lang, blockKey: _k, settingsKind, ...rest }: Omit<SettingsViewProps, 'loginHref' | 'kind'> & Own & { settingsKind: SettingsViewProps['kind'] }) {
  return <SettingsViewIsland {...rest} kind={settingsKind} loginHref={loginHref(lang)} />
}

// Редактор раздела APP-CONFIG: подписи полей выбирает СЕРВЕР (`fieldsUi(lang)`) и отдаёт островку пропсом — словарь в
// браузер целиком не едет.
export function SettingsEditor({ lang, blockKey: _k, ...rest }: Omit<SettingsEditorProps, 'loginHref' | 'ui' | 'lang'> & Own) {
  return <SettingsEditorIsland {...rest} lang={lang} ui={fieldsUi(lang)} loginHref={loginHref(lang)} />
}

// Редактор шапки или подвала: меню «как сейчас» и кандидаты — из оболочки проекта, которую сайт отдаёт всем элементам.
// Читается на сервере и кэшируется минутами (`'use cache'`), как шапка самого элемента.
async function shellMenu(lang: string, slot: NavSlot): Promise<{ current: NavItem[]; candidates: NavCandidate[] }> {
  'use cache'
  cacheLife('minutes')
  const shell = await loadProjectShell(lang)
  const groups: ShellGroup[] = shell ? (slot === 'top' ? shell.top : shell.footer) : []
  const hrefOf = (g: ShellGroup) => g.href ?? `/${lang}/${g.slug}`
  const current: NavItem[] = groups.map((g, i) => ({
    id: g.slug,
    href: hrefOf(g),
    order: (i + 1) * 10,
    label: g.label,
    ...(g.children.length ? { children: g.children.filter((c) => c.href).map((c) => ({ id: c.slug, href: c.href as string, label: c.title })) } : {}),
  }))
  const all = shell ? [...shell.top, ...shell.footer] : []
  const seen = new Set<string>()
  const candidates: NavCandidate[] = []
  for (const g of all) {
    for (const c of [{ id: g.slug, href: hrefOf(g), title: g.label, section: g.label }, ...g.children.filter((c) => c.href).map((c) => ({ id: c.slug, href: c.href as string, title: c.title, section: g.label }))]) {
      if (!seen.has(c.href)) { seen.add(c.href); candidates.push(c) }
    }
  }
  return { current, candidates }
}

export async function MenuEditor({ lang, blockKey: _k, slot, ...rest }: Omit<MenuEditorProps, 'loginHref' | 'ui' | 'current' | 'candidates' | 'editLang'> & Own) {
  const { current, candidates } = await shellMenu(lang, slot)
  return <MenuEditorIsland {...rest} slot={slot} editLang={lang} current={current} candidates={candidates} ui={groupsUi(lang)} loginHref={loginHref(lang)} />
}

export function RoutingEditorBlock({ lang, blockKey: _k, words }: Own & { words: AccessWords }) {
  return <RoutingEditorIsland ui={groupsUi(lang)} words={words} loginHref={loginHref(lang)} />
}

// Правовая страница о куки живёт у САЙТА (`/<язык>/cookies`), поэтому ссылка — на адрес сайта.
export function CookieBannerBlock({ lang, blockKey: _k, words }: Own & { words: AccessWords }) {
  return <CookieBannerIsland ui={groupsUi(lang)} words={words} loginHref={loginHref(lang)} policyHref={SITE ? `${SITE}/${lang}/cookies` : undefined} />
}

// Языки: каталог (84 записи) собирает СЕРВЕР — в браузер едут имя, флаг и качество перевода, а не весь справочник.
// Набор, с которым сайт собран сейчас, — из оболочки проекта.
export async function LanguagesBlock({ lang, blockKey: _k, words }: Own & { words: AccessWords }) {
  const catalogue = Object.values(ALL_LANGUAGE_METADATA)
    .map((m) => ({ code: m.code, flag: m.flag, nativeName: m.nativeName, englishName: m.englishName, tier: m.aiTier }))
    .sort((a, b) => a.englishName.localeCompare(b.englishName))
  const shell = await shellLanguages(lang)
  return <LanguagesIsland catalogue={catalogue} built={shell.languages} builtDefault={shell.defaultLang} ui={groupsUi(lang)} words={words} loginHref={loginHref(lang)} />
}

async function shellLanguages(lang: string): Promise<{ languages: string[]; defaultLang: string }> {
  'use cache'
  cacheLife('minutes')
  const shell = (await loadProjectShell(lang)) as unknown as { languages?: unknown; defaultLang?: unknown } | null
  const codes = Array.isArray(shell?.languages)
    ? (shell.languages as unknown[]).map((x) => (typeof x === 'string' ? x : (x as { code?: string })?.code)).filter((x): x is string => typeof x === 'string')
    : ['en']
  return { languages: codes, defaultLang: typeof shell?.defaultLang === 'string' ? shell.defaultLang : codes[0] }
}
