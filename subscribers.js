// ПОДПИСЧИКИ НА ИЗМЕНЕНИЕ НАСТРОЕК (шаг 306, решение владельца 2026-09-26: «заводи шаг, строим уведомление от CONFIG»).
//
// 🔒 ЗАМЕНЯЕТ ЗАКОН 299-6 «ЭЛЕМЕНТ НИКОГО НЕ ЗОВЁТ» — и ровно в названном объёме. После сохранения архитектором элемент
// шлёт каждому подписчику сигнал «версия сменилась»; настроек в сигнале нет, подписчик забирает их сам по MCP тем же путём,
// что при старте. Действие — только в ответ на сохранение человеком: ни таймеров, ни опросов, ни повторов.
//
// 🔒 ПОДПИСКА ДОБРОВОЛЬНА И НИЧЕГО НЕ ГАРАНТИРУЕТ. Подписчик, который не ответил, остаётся в списке и получит следующий
// сигнал; пропущенный сигнал он наверстает при своём старте, сверив версию. Отказ доставки не валит сохранение.
//
// Реестр — файл `subscribers.json` в папке данных элемента (`SETTINGS_DATA_DIR`), вне сборки и вне git.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const file = () => join(process.env.SETTINGS_DATA_DIR || join(ROOT, 'data', 'settings'), 'subscribers.json')
const TIMEOUT_MS = 5000

export function listSubscribers() {
  try {
    const list = JSON.parse(readFileSync(file(), 'utf8')).subscribers
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/**
 * Подписать адрес двери подписчика. Разрешены только http(s). Одна служба (`who`) — одна запись, как и один адрес:
 * повторная подписка заменяет прежнюю. ✗ Иначе пробный запуск службы при установке (другой порт) оставался в реестре
 * мёртвым адресом, и каждый сигнал уходил и в пустоту (замерено на узле 2026-09-26: root на 24699 и 24683).
 */
export function subscribe(url, who) {
  let u
  try {
    u = new URL(String(url))
  } catch {
    return { ok: false, reason: 'bad-url' }
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false, reason: 'bad-url' }
  const id = who ? String(who).slice(0, 64) : null
  const list = listSubscribers().filter((s) => s.url !== u.href && !(id && s.who === id))
  list.push({ url: u.href, who: id, since: new Date().toISOString() })
  mkdirSync(dirname(file()), { recursive: true })
  writeFileSync(file(), JSON.stringify({ subscribers: list }, null, 2) + '\n')
  return { ok: true, url: u.href, subscribers: list.length }
}

/** Разослать сигнал «версия сменилась». Возвращает, кто принял, — для ответа экрану и журнала. */
export async function notifySubscribers(version) {
  const key = process.env.SETTINGS_SECRET ?? ''
  const list = listSubscribers()
  return Promise.all(
    list.map(async (s) => {
      try {
        const r = await fetch(s.url, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-settings-key': key },
          body: JSON.stringify({ version }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
        return { url: s.url, who: s.who, ok: r.ok, status: r.status }
      } catch (e) {
        return { url: s.url, who: s.who, ok: false, status: 0, reason: String(e?.name ?? e) }
      }
    }),
  )
}
