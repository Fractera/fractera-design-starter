// ЭЛЕМЕНТ УЗЛА «ДИЗАЙН» (шаг 309, 2026-09-26) — оформление проекта: цвета, шрифты, текст, формы, настройки блоков.
//
// Слово владельца: «создать отдельный полностью микро сервис такой же как у блок … любые микро сервисы … будут менять свой
// дизайн … в тот момент когда микро сервис дизайн будет вносить изменения». Основа — элемент CONFIG (299): та же анатомия,
// один вид настроек (design). После сохранения — сигнал подписчикам (`subscribers.js`), и каждая служба перекрашивается.
//
//   GET  /health                     — жив ли (без ключа: это дверь сторожа);
//   POST /mcp                        — MCP: настройки проекта командами для агента (`mcp-tools.js`, каркас `mcp/serve-mcp.js`);
//   GET  /, /en, /ru, /<язык>/…      — сайт элемента: публичная главная и режим архитектора (Next в этом же процессе).
//   GET  /api/settings[/<вид>]       — оформление проекта (design): ключ служб X-Settings-Key ИЛИ архитектор;
//   PATCH /api/settings/<вид>        — записать заплату: ТОЛЬКО архитектор (ключ служб записи не даёт); после записи —
//                                      сигнал подписчикам «версия сменилась» (306, `subscribers.js`);
//   GET  /api/session                — архитектор ли тот, кто смотрит (для экранов режима архитектора);
//   GET  /api/elements               — все элементы узла и их адреса (только архитектор): ссылки в окне перед выключением
//                                       меню или входа (реестр узла NODE_ITEMS_FILE + домен NODE_DOMAIN_FILE).
// A2A и M2M этот прототип НЕ даёт — названо в паспорте, а не скрыто.
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import next from 'next'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { mcpHandler } from './mcp/serve-mcp.js'
import { configTools } from './mcp-tools.js'
import { KINDS, readSettings, writeSettings } from './settings-store.js'
import { notifySubscribers } from './subscribers.js'
import { readAll, versionOf } from './mcp-tools.js'
import { sessionOf, keyOk } from './architect-auth.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
config({ path: join(ROOT, '.env'), quiet: true })

const PORT = Number(process.env.PORT) || 24685
const BIND = process.env.SERVICE_BIND || '127.0.0.1'
const PUBLIC_URL = process.env.SERVICE_PUBLIC_URL || `http://localhost:${PORT}`
const VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version

// Сайт элемента: сборка в папке, которую называет метка `.presentation-dist` (установщик чередует .next-a / .next-b).
const distMarker = join(ROOT, '.presentation-dist')
process.env.NEXT_DIST_DIR = existsSync(distMarker) ? readFileSync(distMarker, 'utf8').trim() : '.next'
// Дерево страниц (шаг 298): страница — папка `presentation/content/<коллекция>/<slug>/`, шаблон у всех один.
process.env.PAGE_TREE_DIR = resolve(ROOT, 'presentation', 'content')
const nextApp = next({ dev: false, dir: resolve(ROOT, 'presentation') })
const site = nextApp.prepare().then(() => nextApp.getRequestHandler()).catch((err) => {
  console.warn(`[site] не собран (${process.env.NEXT_DIST_DIR}): ${err instanceof Error ? err.message : err} — npm run build`)
  return null
})

const mcp = mcpHandler({ name: 'fractera-design', version: VERSION, tools: configTools(PUBLIC_URL) })

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  const chunks = []
  for await (const c of req) chunks.push(c)
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null') } catch { return undefined }
}

// Настройки: читать — ключ служб или архитектор; писать — только архитектор.
async function settingsDoor(req, res, kind) {
  if (req.method === 'GET') {
    let allowed = keyOk(req)
    if (!allowed) {
      const s = await sessionOf(req)
      if (s.status !== 200) return json(res, s.status, { ok: false, reason: s.reason })
      allowed = s.architect
    }
    if (!allowed) return json(res, 403, { ok: false, reason: 'not-architect' })
    if (!kind) {
      const all = Object.fromEntries(KINDS.map((k) => [k, readSettings(k)]))
      const bad = Object.values(all).find((r) => !r.ok)
      // Потребители берут настройки по MCP (`get_project_settings`, 299-6); эта дверь — для экранов самого элемента.
      return bad ? json(res, 500, { ok: false, reason: bad.reason }) : json(res, 200, { ok: true, settings: Object.fromEntries(KINDS.map((k) => [k, all[k].config])) })
    }
    const r = readSettings(kind)
    return json(res, r.ok ? 200 : r.reason === 'unknown-kind' ? 404 : 500, r)
  }
  if (req.method === 'PATCH' && kind) {
    const s = await sessionOf(req)
    if (s.status !== 200) return json(res, s.status, { ok: false, reason: s.reason })
    if (!s.architect) return json(res, 403, { ok: false, reason: 'not-architect' })
    const body = await readBody(req)
    const r = writeSettings(kind, body)
    if (!r.ok) return json(res, r.reason === 'bad-body' ? 400 : r.reason === 'unknown-kind' ? 404 : 500, r)
    // 306: после сохранения — сигнал подписчикам «версия сменилась»; настройки они забирают сами по MCP. Отказ доставки
    // сохранения не отменяет: экран узнаёт, сколько служб приняли сигнал (`notified`).
    let notified = []
    try {
      notified = await notifySubscribers(versionOf(readAll()))
      for (const n of notified) console.log(`[settings] сигнал ${n.who ?? n.url}: ${n.ok ? 'принят' : `не принят (${n.status || n.reason})`}`)
    } catch (e) {
      console.warn(`[settings] рассылка не удалась: ${e?.message ?? e}`)
    }
    return json(res, 200, { ...r, notified })
  }
  return json(res, 405, { ok: false, reason: 'method' })
}

// Элементы узла и их публичные адреса — то же правило, что у двери ядра `/api/node/reach`: сайт (root) — корень зоны,
// ядро — architect.<зона>, остальные — <id>.<зона>. Домена нет — адрес на петле машины (он годится только на ней).
function elementsOfNode() {
  let registry, domain = null
  try { registry = JSON.parse(readFileSync(process.env.NODE_ITEMS_FILE ?? '', 'utf8')) } catch { return null }
  try { domain = JSON.parse(readFileSync(process.env.NODE_DOMAIN_FILE ?? '', 'utf8')) } catch { /* домен не подключён */ }
  const zone = domain?.zone
  const list = [{ id: 'core', url: zone ? `https://${domain.architectHostname ?? `architect.${zone}`}` : null }]
  for (const s of registry.services ?? []) {
    const url = zone ? (s.id === 'root' ? `https://${domain.hostname ?? zone}` : `https://${s.id}.${zone}`) : Number.isInteger(s.port) ? `http://127.0.0.1:${s.port}` : null
    list.push({ id: s.id, url })
  }
  return list
}

// ВОРОТА РЕЖИМА АРХИТЕКТОРА (299-8). Слово владельца при открытии 299: публичная главная, а из неё «переход в защищенный
// авторизацией и руль архитектора режим». ✗ Измерено 2026-09-25: без ворот `/ru/architect` отдавал 200 любому — меню,
// разделы и подписи переключателей; под замком были только двери данных. Ворота стоят ДО Next: страница остаётся
// статической, а её HTML не уходит тому, кто не архитектор.
//   нет сессии → 302 на вход (публичный адрес входа из домена узла), с возвратом на ту же страницу;
//   сессия без роли архитектора → 403; служба входа молчит → 503. Кука входа — на всю зону (COOKIE_DOMAIN входа).
const ARCHITECT_PATH = /^\/(en|ru)\/architect(?:\/.*)?$/
const GATE_WORDS = {
  en: { forbidden: 'Only the architect of the project can open the settings.', unavailable: 'The sign-in service is not answering right now — try again in a minute.', home: 'Back to the home page' },
  ru: { forbidden: 'Открыть настройки может только архитектор проекта.', unavailable: 'Служба входа сейчас не отвечает — попробуйте через минуту.', home: 'На главную' },
}
function loginUrl(lang, back) {
  let domain = null
  try { domain = JSON.parse(readFileSync(process.env.NODE_DOMAIN_FILE ?? '', 'utf8')) } catch { /* домен не подключён */ }
  const auth = domain?.authHostname ? `https://${domain.authHostname}` : null
  if (auth) return `${auth}/login?callbackUrl=${encodeURIComponent(back)}`
  const site = (process.env.PROJECT_SITE_URL ?? '').replace(/\/+$/, '')
  return site ? `${site}/login?lang=${lang}` : null
}
function gatePage(res, status, lang, text) {
  const w = GATE_WORDS[lang] ?? GATE_WORDS.en
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' })
  res.end(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Design</title></head><body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem"><p>${text}</p><p><a href="/${lang}">${w.home}</a></p></body></html>`)
}
async function architectGate(req, res, lang, pathname) {
  const s = await sessionOf(req)
  if (s.status === 200 && s.architect) return true
  const w = GATE_WORDS[lang] ?? GATE_WORDS.en
  if (s.status === 200) { gatePage(res, 403, lang, w.forbidden); return false }
  if (s.status === 401) {
    const back = `${(process.env.SERVICE_PUBLIC_URL ?? '').replace(/\/+$/, '')}${pathname}`
    const to = loginUrl(lang, back)
    if (to) { res.writeHead(302, { location: to, 'cache-control': 'no-store' }); res.end(); return false }
  }
  gatePage(res, 503, lang, w.unavailable)
  return false
}

const SITE_PATH = /^\/(?:(en|ru)(?:\/.*)?|_next\/.*|robots\.txt|sitemap\.xml)$/

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://x')
  try {
    if (pathname === '/health') return json(res, 200, { ok: true, service: 'design', version: VERSION })
    if (pathname === '/mcp') return await mcp(req, res)
    // 308: сигнал «версия сменилась» принимает сайт элемента (перерисовка страниц) — до двери настроек.
    if (pathname === '/api/settings/changed') {
      const handle = await site
      if (!handle) return json(res, 503, { error: 'site-not-built', fix: 'npm run build' })
      return await handle(req, res)
    }
    if (pathname === '/api/settings' || pathname.startsWith('/api/settings/')) {
      const kind = pathname.slice('/api/settings/'.length) || null
      return await settingsDoor(req, res, pathname === '/api/settings' ? null : kind)
    }
    if (pathname === '/api/elements') {
      const s = await sessionOf(req)
      if (s.status !== 200) return json(res, s.status, { ok: false, reason: s.reason })
      if (!s.architect) return json(res, 403, { ok: false, reason: 'not-architect' })
      const list = elementsOfNode()
      return list ? json(res, 200, { ok: true, elements: list }) : json(res, 500, { ok: false, reason: 'registry-unreadable' })
    }
    if (pathname === '/api/session') {
      const s = await sessionOf(req)
      return json(res, s.status === 200 ? 200 : s.status, s.status === 200 ? { ok: true, architect: s.architect } : { ok: false, reason: s.reason })
    }
    if (pathname === '/') { res.writeHead(302, { location: '/en' }); return res.end() }
    const arch = ARCHITECT_PATH.exec(pathname)
    if (arch && !(await architectGate(req, res, arch[1], pathname))) return
    if (SITE_PATH.test(pathname)) {
      const handle = await site
      if (!handle) return json(res, 503, { error: 'site-not-built', fix: 'npm run build' })
      return await handle(req, res)
    }
    return json(res, 404, { error: 'not-found', doors: ['/en', '/ru', '/health', '/mcp', '/api/settings', '/api/settings/design', '/api/session'] })
  } catch (err) {
    console.error('[config]', err)
    if (!res.headersSent) json(res, 500, { error: 'internal' })
  }
}).listen(PORT, BIND, () => {
  console.log(`fractera-design ${VERSION} · http://${BIND}:${PORT}`)
})
