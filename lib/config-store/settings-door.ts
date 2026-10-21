// 549-1: дверь настроек config — дословно логика `settingsDoor` из server.js v0.2.26. Читать — ключ служб узла (X-Settings-Key) или
// архитектор; писать — только архитектор; после сохранения — сигнал подписчикам «версия сменилась» (306), его отказ сохранение не отменяет.
import { KINDS, readSettings, writeSettings } from "./settings-store.mjs"
import { notifySubscribers } from "./subscribers.mjs"
import { readAll, versionOf } from "./mcp-tools.mjs"
import { sessionOf, keyOk } from "./architect-auth.mjs"
import { json, headersOf } from "./http"

type Read = { ok: boolean; reason?: string; config?: unknown }

export async function settingsDoor(req: Request, kind: string | null): Promise<Response> {
  const r0 = { headers: headersOf(req) }
  if (req.method === "GET") {
    let allowed = keyOk(r0)
    if (!allowed) {
      const s = await sessionOf(r0)
      if (s.status !== 200) return json(s.status, { ok: false, reason: s.reason })
      allowed = s.architect
    }
    if (!allowed) return json(403, { ok: false, reason: "not-architect" })
    if (!kind) {
      const all = Object.fromEntries((KINDS as string[]).map((k) => [k, readSettings(k) as Read]))
      const bad = Object.values(all).find((r) => !r.ok)
      return bad ? json(500, { ok: false, reason: bad.reason }) : json(200, { ok: true, settings: Object.fromEntries((KINDS as string[]).map((k) => [k, all[k].config])) })
    }
    const r = readSettings(kind) as Read
    return json(r.ok ? 200 : r.reason === "unknown-kind" ? 404 : 500, r)
  }
  if (req.method === "PATCH" && kind) {
    const s = await sessionOf(r0)
    if (s.status !== 200) return json(s.status, { ok: false, reason: s.reason })
    if (!s.architect) return json(403, { ok: false, reason: "not-architect" })
    let body: unknown
    try { body = JSON.parse((await req.text()) || "null") } catch { body = undefined }
    const r = writeSettings(kind, body) as Read
    if (!r.ok) return json(r.reason === "bad-body" ? 400 : r.reason === "unknown-kind" ? 404 : 500, r)
    let notified: Array<{ ok: boolean; who?: string; url?: string; status?: number; reason?: string }> = []
    try {
      notified = await notifySubscribers(versionOf(readAll()))
      for (const n of notified) console.log(`[settings] сигнал ${n.who ?? n.url}: ${n.ok ? "принят" : `не принят (${n.status || n.reason})`}`)
    } catch (e) {
      console.warn(`[settings] рассылка не удалась: ${e instanceof Error ? e.message : e}`)
    }
    return json(200, { ...r, notified })
  }
  return json(405, { ok: false, reason: "method" })
}
