'use client'

// РЕДАКТОР РАЗДЕЛА «ДИЗАЙНА» (310) — загрузчик ядра (`agi-code/components/design/design-section-loader.client.tsx`,
// он же aifa.dev/ru/architect/design), перенесённый на дверь элемента. Четыре редактора — дословные копии ядра.
//
// 🛑 Отказ двери — СОСТОЯНИЕ («войдите», «не архитектор», «вход недоступен», «ошибка»), а не пустые настройки: пустой
// редактор при отказе предложил бы сохранить пустоту поверх настоящего оформления.
import { useEffect, useState } from 'react'
import { DesignColors } from './design-colors.client'
import { DesignFonts } from './design-fonts.client'
import { DesignType } from './design-type.client'
import { DesignShape } from './design-shape.client'
import type { DesignUi } from './design.i18n'
import { loadSettings, type Access, type AccessWords } from '@/components/settings/settings-access'
import { AccessNotice } from '@/components/settings/access-notice'

export type DesignSection = 'colors' | 'fonts' | 'type' | 'shape'

type Raw = {
  colors?: { light?: Record<string, string>; dark?: Record<string, string> }
  fonts?: Record<string, { family: string; import?: string }>
  type?: { scale?: number; leading?: number }
  shape?: { radius?: string; borderWidth?: string; spaceScale?: number; appWidth?: string }
}

export type DesignEditorProps = {
  section: DesignSection
  ui: Pick<DesignUi, DesignSection>
  words: AccessWords
  loginHref?: string
}

export function DesignEditorIsland({ section, ui, words, loginHref }: DesignEditorProps) {
  const [access, setAccess] = useState<Access>('loading')
  const [config, setConfig] = useState<Raw | null>(null)

  useEffect(() => {
    loadSettings('design').then((r) => {
      setAccess(r.access)
      setConfig(r.config as Raw | null)
    })
  }, [])

  if (access !== 'ok' || !config) return <AccessNotice access={access} words={words} loginHref={loginHref} />

  const c = config
  return section === 'colors' ? (
    <DesignColors initial={{ light: c.colors?.light ?? {}, dark: c.colors?.dark ?? {} }} ui={ui.colors} />
  ) : section === 'fonts' ? (
    <DesignFonts initial={c.fonts ?? {}} ui={ui.fonts} />
  ) : section === 'type' ? (
    <DesignType initial={c.type ?? {}} ui={ui.type} />
  ) : (
    <DesignShape initial={c.shape ?? {}} ui={ui.shape} />
  )
}
