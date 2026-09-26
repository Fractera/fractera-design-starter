// КТО ПРИШЁЛ — АРХИТЕКТОР ИЛИ НЕТ (шаг 299-2). Вход раздаёт ровно одна служба узла; этот элемент своих паролей не держит.
// Куки посетителя пересылаются в `AUTH_SERVICE_URL/api/session`, ответ — сессия с ролями (образец — `requireAuth` службы данных).
// Менять настройки проекта могут только роли ARCHITECT_ROLES: слово владельца — «переход в защищённый авторизацией и руль
// архитектора режим».
// 🔒 Служба входа недоступна — это «не знаю» (503), а не «нельзя» (401): иначе архитектор увидел бы «у вас нет прав» в
// день, когда просто лёг вход.
import { timingSafeEqual } from 'node:crypto'

const ARCHITECT_ROLES = new Set(['architect', 'admin'])

export async function sessionOf(req) {
  const auth = (process.env.AUTH_SERVICE_URL ?? '').replace(/\/+$/, '')
  if (!auth) return { status: 503, reason: 'auth-not-configured' }
  const cookie = req.headers.cookie ?? ''
  if (!cookie) return { status: 401, reason: 'no-session' }
  try {
    const r = await fetch(`${auth}/api/session`, { headers: { cookie }, signal: AbortSignal.timeout(5000) })
    if (r.status === 401 || r.status === 403) return { status: 401, reason: 'no-session' }
    if (!r.ok) return { status: 503, reason: `auth-${r.status}` }
    const session = await r.json()
    const roles = Array.isArray(session?.roles) ? session.roles : []
    return { status: 200, roles, architect: roles.some((x) => ARCHITECT_ROLES.has(x)) }
  } catch {
    return { status: 503, reason: 'auth-unreachable' }
  }
}

/** Ключ служб узла: им другие элементы ЧИТАЮТ настройки. Записи ключ не даёт. */
export function keyOk(req) {
  const expected = process.env.SETTINGS_SECRET ?? ''
  const given = String(req.headers['x-settings-key'] ?? '')
  if (!expected || given.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected))
}
