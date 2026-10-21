// 549-2: серверная обёртка редактора оформления — дословно `DesignEditorBlock` из `presentation/components/settings/blocks.tsx` design v0.1.4.
// Ссылку на вход дают отсюда, из окружения узла (`PROJECT_SITE_URL`); слова раздела выбирает СЕРВЕР — словарь в браузер целиком не едет.
import { DesignEditorIsland, type DesignSection } from './design-editor.client'
import { designUi } from './design.i18n'
import type { AccessWords } from './settings-access'

const SITE = (process.env.PROJECT_SITE_URL ?? '').replace(/\/+$/, '')
const loginHref = (lang: string) => (SITE ? `${SITE}/login?lang=${lang}` : undefined)

type Own = { lang: string; blockKey?: string }

export function DesignEditorBlock({ lang, blockKey: _k, section, words }: Own & { section: DesignSection; words: AccessWords }) {
  const all = designUi(lang)
  return <DesignEditorIsland section={section} ui={{ colors: all.colors, fonts: all.fonts, type: all.type, shape: all.shape }} words={words} loginHref={loginHref(lang)} />
}
