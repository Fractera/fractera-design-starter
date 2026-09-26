'use client'

// РЕДАКТОРЫ PLATFORM-CONFIG (шаг 299-5): параллельная маршрутизация и куки-баннер — группы parallelRouting и cookieBanner
// редактора aifa.dev/ru/architect/app-config. `RoutingEditor` и `FeaturesEditor` перенесены как есть; значения приходят из
// двери элемента, запись уходит туда же.
import { useEffect, useState } from 'react'
import { RoutingEditor } from './routing-editor.client'
import { FeaturesEditor } from './features-editor.client'
import type { GroupsUi } from './groups.i18n'
import { activeSlots, modeOf } from '@/lib/settings/routing'
import { loadSettings, type Access, type AccessWords } from './settings-access'
import { AccessNotice } from './access-notice'

function usePlatform() {
  const [access, setAccess] = useState<Access>('loading')
  const [config, setConfig] = useState<Record<string, unknown> | null>(null)
  useEffect(() => {
    loadSettings('platform').then((r) => {
      setAccess(r.access)
      setConfig(r.config)
    })
  }, [])
  return { access, config }
}

type Common = { ui: GroupsUi; words: AccessWords; loginHref?: string }

export function RoutingEditorIsland({ ui, words, loginHref }: Common) {
  const { access, config } = usePlatform()
  if (access !== 'ok' || !config) return <AccessNotice access={access} words={words} loginHref={loginHref} />
  return <RoutingEditor initialMode={modeOf(config)} initialSlots={activeSlots(config)} ui={ui} />
}

/** Куки-баннер: выключатель и ссылка на правовую страницу сайта (адрес не настраивается — так и на aifa.dev). */
export function CookieBannerIsland({ ui, words, loginHref, policyHref }: Common & { policyHref?: string }) {
  const { access, config } = usePlatform()
  if (access !== 'ok' || !config) return <AccessNotice access={access} words={words} loginHref={loginHref} />
  return (
    <FeaturesEditor
      title={ui.cookies.title}
      hint={ui.cookies.hint}
      switches={[
        {
          key: 'cookieBanner',
          label: ui.cookies.enable,
          hint: ui.cookies.enableHint,
          notice: { on: ui.cookies.onNotice, off: ui.cookies.offNotice },
          initial: config.cookieBanner === true,
        },
      ]}
      ui={ui}
    >
      {policyHref && (
        <section className="flex flex-col gap-2">
          <a href={policyHref} className="text-[length:var(--fs-body)] text-primary hover:underline" data-cookie-policy-link>
            {ui.cookies.linkTitle}
          </a>
          <p className="text-sm text-muted-foreground">{ui.cookies.linkHint}</p>
        </section>
      )}
    </FeaturesEditor>
  )
}
