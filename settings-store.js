// ХРАНИЛИЩЕ НАСТРОЕК ПРОЕКТА (шаг 299-2). Три вида: app (APP-CONFIG), platform (PLATFORM-CONFIG), design (DESIGN-CONFIG).
//
//   settings/<вид>/defaults.json — умолчания (в git, приходят с элементом; перенесены из сайта узла как есть);
//   settings/<вид>/schema.json   — схема (в git);
//   data/settings/<вид>.json     — правки ВЛАДЕЛЬЦА заплатой поверх умолчаний (не в git: это данные узла, а не код).
//
// 🔒 «НЕТ ФАЙЛА» И «НЕ СМОГЛИ ПРОЧИТАТЬ» — РАЗНЫЕ ОТВЕТЫ. ✗ Оплачено 2026-09-25: дверь сайта при любой ошибке чтения
// отвечала `{}` — тем же, что «ничего не настроено», — и ядро записало эту пустоту поверх голубой палитры. Здесь: файла нет
// → законная пустая заплата; файл есть, но не читается или не разбирается → ошибка, которую дверь отдаёт как отказ.
// 🔒 Запись атомарна (временный файл + rename): читатель никогда не видит полузаписанный файл.
import { readFileSync, writeFileSync, renameSync, mkdirSync, unlinkSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
// Элемент «Дизайн» (309): один вид настроек — оформление проекта.
export const KINDS = ['design']

const dataDir = () => process.env.SETTINGS_DATA_DIR || join(ROOT, 'data', 'settings')
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
export const merge = (a, b) => {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = isObj(v) && isObj(out[k]) ? merge(out[k], v) : v
  return out
}
// Заплата по правилам JSON Merge Patch (RFC 7386): `null` УДАЛЯЕТ ключ. Так редактор стирает пустой перевод —
// «перевода нет» и «перевод пустой» одно состояние (перенесено из редактора aifa.dev/ru/architect/app-config).
export const applyPatch = (a, b) => {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) {
    if (v === null) delete out[k]
    else out[k] = isObj(v) ? applyPatch(isObj(out[k]) ? out[k] : {}, v) : v
  }
  return out
}

function readJson(file, missing) {
  let raw
  try {
    raw = readFileSync(file, 'utf8')
  } catch (err) {
    if (err && err.code === 'ENOENT') return { ok: true, value: missing }
    return { ok: false, reason: 'read-failed', detail: String(err?.code ?? err) }
  }
  try {
    const value = JSON.parse(raw)
    return isObj(value) ? { ok: true, value } : { ok: false, reason: 'not-an-object' }
  } catch {
    return { ok: false, reason: 'bad-json' }
  }
}

/** Один вид: умолчания, правки владельца и итог (правки поверх умолчаний). */
export function readSettings(kind) {
  if (!KINDS.includes(kind)) return { ok: false, reason: 'unknown-kind' }
  const defaults = readJson(join(ROOT, 'settings', kind, 'defaults.json'), null)
  if (!defaults.ok || !defaults.value) return { ok: false, reason: 'defaults-missing' }
  const patch = readJson(join(dataDir(), `${kind}.json`), {})
  if (!patch.ok) return { ok: false, reason: patch.reason, detail: patch.detail }
  return { ok: true, kind, defaults: defaults.value, patch: patch.value, config: merge(defaults.value, patch.value) }
}

/** Записать заплату поверх того, что уже сохранено. Возвращает новый итог. */
export function writeSettings(kind, body) {
  if (!KINDS.includes(kind)) return { ok: false, reason: 'unknown-kind' }
  if (!isObj(body)) return { ok: false, reason: 'bad-body' }
  const current = readSettings(kind)
  if (!current.ok) return current // не затираем то, что не смогли прочитать
  const next = applyPatch(current.patch, body)
  const file = join(dataDir(), `${kind}.json`)
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
  try {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(tmp, JSON.stringify(next, null, 2) + '\n', 'utf8')
    renameSync(tmp, file)
  } catch (err) {
    if (existsSync(tmp)) try { unlinkSync(tmp) } catch { /* уже нет */ }
    return { ok: false, reason: 'write-failed', detail: String(err?.code ?? err) }
  }
  return readSettings(kind)
}
