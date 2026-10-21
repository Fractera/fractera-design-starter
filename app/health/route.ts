// @api health of the design element for the node watcher
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { json } from "@/lib/config-store/http"

// 549-2: дверь прежнего design (`/health`), ответ тот же — { ok, service, version }. Своя `/api/health` шаблона остаётся.
export const dynamic = "force-dynamic"
const VERSION = (() => { try { return JSON.parse(readFileSync(join(process.env.ELEMENT_DIR || process.cwd(), "package.json"), "utf8")).version as string } catch { return "unknown" } })()

export function GET() {
  return json(200, { ok: true, service: "design", version: VERSION })
}
