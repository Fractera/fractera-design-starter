'use client'

// СООБЩЕНИЯ РЕДАКТОРОВ НАСТРОЕК (шаг 299-5). Редакторы перенесены с aifa.dev как есть и зовут `toast.success/error/info`
// (там — пакет sonner). Здесь тот же интерфейс без пакета: сообщение уходит событием окна, `SettingsToaster` (один на
// страницу, в макете `[lang]`) показывает последнее.
//
// 🔒 ТОСТ ВЫЕЗЖАЕТ СВЕРХУ ПО ЦЕНТРУ — как тост входа (слово владельца 2026-09-25: «когда мы входим в авторизацию, нам
// опускается сверху вниз тост … тут точно также»). Два рода:
//   · обычный — изменение принято;
//   · `deploy` — изменение вступит в силу только после развёртывания проекта: в тосте кнопка на дашборд развёртываний
//     ядра (адрес даёт макет из ARCHITECT_URL), потому что иначе человек сохранит и не поймёт, почему ничего не поменялось.
import { useEffect, useState } from 'react'

type Kind = 'success' | 'error' | 'info' | 'deploy'
type Message = { kind: Kind; text: string; id: number }
const EVENT = 'settings-toast'

function emit(kind: Kind, text: string) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<Message>(EVENT, { detail: { kind, text, id: Date.now() } }))
}

export const toast = {
  success: (text: string) => emit('success', text),
  error: (text: string) => emit('error', text),
  info: (text: string) => emit('info', text),
  message: (text: string) => emit('info', text),
  /** Вступит в силу после развёртывания — тост с кнопкой на дашборд развёртываний. */
  deploy: (text: string) => emit('deploy', text),
}

export function SettingsToaster({ deployHref, deployLabel, closeLabel }: { deployHref?: string; deployLabel: string; closeLabel: string }) {
  const [message, setMessage] = useState<Message | null>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const onMessage = (e: Event) => {
      const m = (e as CustomEvent<Message>).detail
      setMessage(m)
      setShown(false)
      requestAnimationFrame(() => setShown(true))
      clearTimeout(timer)
      // Тост с кнопкой живёт, пока его не закроют: за шесть секунд человек не успеет решить, идти ли на развёртывание.
      if (m.kind !== 'deploy') timer = setTimeout(() => setShown(false), 6000)
    }
    window.addEventListener(EVENT, onMessage)
    return () => {
      window.removeEventListener(EVENT, onMessage)
      clearTimeout(timer)
    }
  }, [])
  if (!message) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 top-4 z-50 w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border bg-card px-4 py-3 text-sm shadow-lg transition-all duration-300 ${shown ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none'} ${message.kind === 'error' ? 'border-destructive text-destructive' : message.kind === 'deploy' ? 'border-amber-500' : 'border-border'}`}
    >
      <p>{message.text}</p>
      {message.kind === 'deploy' && (
        <div className="mt-3 flex items-center gap-3">
          {deployHref && (
            <a href={deployHref} className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90">
              {deployLabel}
            </a>
          )}
          <button type="button" onClick={() => setShown(false)} className="text-muted-foreground hover:underline">
            {closeLabel}
          </button>
        </div>
      )}
    </div>
  )
}
