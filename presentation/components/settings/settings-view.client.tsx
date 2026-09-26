'use client'

// ПРОСМОТР РАЗДЕЛА НАСТРОЕК (шаг 299-4): текущие значения ключей раздела так, как их видит каждый элемент узла.
// Подшаг 299-5 ставит на это место редактор раздела (перенос движков aifa.dev/ru/architect/app-config).
import { useEffect, useState } from 'react'
import { loadSettings, type Access, type AccessWords, type SettingsKind } from './settings-access'
import { AccessNotice } from './access-notice'

export type SettingsViewProps = {
  kind: SettingsKind
  keys: string[]
  title: string
  empty: string
  words: AccessWords
  loginHref?: string
}

export function SettingsViewIsland({ kind, keys, title, empty, words, loginHref }: SettingsViewProps) {
  const [access, setAccess] = useState<Access>('loading')
  const [config, setConfig] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    loadSettings(kind).then((r) => {
      setAccess(r.access)
      setConfig(r.config)
    })
  }, [kind])

  return (
    <section className="mt-6" aria-label={title}>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4">
        {access !== 'ok' || !config ? (
          <AccessNotice access={access} words={words} loginHref={loginHref} />
        ) : (
          <dl className="flex flex-col gap-3">
            {keys.map((k) => (
              <div key={k} className="rounded-xl border border-border bg-card p-4">
                <dt className="font-mono text-xs text-muted-foreground">{kind}.{k}</dt>
                <dd className="mt-2">
                  {config[k] === undefined ? (
                    <span className="text-sm text-muted-foreground">{empty}</span>
                  ) : (
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm">{JSON.stringify(config[k], null, 2)}</pre>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
