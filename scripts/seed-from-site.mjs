// ПОСЕВ НАСТРОЕК ИЗ САЙТА (шаг 299-2): при рождении элемента на узле его настройки = то, что владелец уже настроил у сайта.
//
//   node scripts/seed-from-site.mjs <папка сайта>        (например AGI-ITEMS/user/root)
//
// Берутся ПРАВКИ владельца сайта — `APP-CONFIG/app-config.json`, `PLATFORM-CONFIG/platform-config.json`,
// `DESIGN-CONFIG/design-config.json` — и кладутся в `data/settings/<вид>.json`.
// 🔒 Уже засеянное НЕ перезаписывается: с этой минуты источник настроек — этот элемент, и повторный посев стёр бы то, что
// архитектор поменял здесь. Файл сайта, который не читается, — отказ посева этого вида, а не пустая заплата (урок 2026-09-25).
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const site = process.argv[2] ? resolve(process.argv[2]) : null
if (!site) {
  console.error('укажите папку сайта: node scripts/seed-from-site.mjs <папка сайта>')
  process.exit(2)
}
// Папки сайта нет — это ОШИБКА пути, а не «сайт ничего не настроил»: молча засеять умолчания значило бы потерять настройки.
if (!existsSync(join(site, 'package.json'))) {
  console.error(`===SEED_FAILED=== ${site} — не папка сайта (нет package.json)`)
  process.exit(2)
}
const DATA = process.env.SETTINGS_DATA_DIR || join(ROOT, 'data', 'settings')
const FROM = { design: 'DESIGN-CONFIG/design-config.json' } // 309: элемент «Дизайн» — только оформление

let failed = 0
for (const [kind, rel] of Object.entries(FROM)) {
  const target = join(DATA, `${kind}.json`)
  if (existsSync(target)) { console.log(`  ${kind}: уже есть — не трогаю`); continue }
  const src = join(site, rel)
  if (!existsSync(src)) { console.log(`  ${kind}: у сайта файла нет — остаются умолчания`); continue }
  let value
  try {
    value = JSON.parse(readFileSync(src, 'utf8'))
    if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('не объект')
  } catch (err) {
    console.error(`  ${kind}: файл сайта не читается (${err instanceof Error ? err.message : err}) — вид НЕ засеян`)
    failed++
    continue
  }
  mkdirSync(DATA, { recursive: true })
  const tmp = `${target}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', 'utf8')
  renameSync(tmp, target)
  console.log(`  ${kind}: засеян из ${rel} (ключей ${Object.keys(value).length})`)
}
console.log(failed ? `===SEED_PARTIAL=== не засеяно видов: ${failed}` : '===SEED_OK===')
process.exit(failed ? 1 : 0)
