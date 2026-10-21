// 549-2: элементы узла и их публичные адреса — дословно из server.js design v0.1.4.
import { readFileSync } from 'node:fs'

export function elementsOfNode() {
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
