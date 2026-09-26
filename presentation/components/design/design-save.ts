// ЗАПИСЬ ОФОРМЛЕНИЯ (310). Редакторы перенесены из ядра дословно; меняется только адрес: ядро писало в свою дверь
// `/api/architect/design-config` (тело `{ patch }`), здесь — дверь элемента `/api/settings/design`, которая сама
// проверяет архитектора и после записи шлёт сигнал подписчикам (309). Тело то же: заплата JSON Merge Patch, `null` стирает.
import { saveSettings } from '@/components/settings/settings-access'

export async function saveDesign({ patch }: { patch: Record<string, unknown> }): Promise<{ ok: boolean }> {
  const r = await saveSettings('design', patch)
  return { ok: r.access === 'ok' && r.config !== null }
}
