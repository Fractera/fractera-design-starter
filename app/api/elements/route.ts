// @api the elements of the node and their public addresses for the architect
import { sessionOf } from "@/lib/config-store/architect-auth.mjs"
import { elementsOfNode } from "@/lib/config-store/node-elements.mjs"
import { json, headersOf } from "@/lib/config-store/http"

// 549-1: прежняя дверь config `/api/elements` — только архитектор.
export const dynamic = "force-dynamic"
export async function GET(req: Request) {
  const s = await sessionOf({ headers: headersOf(req) })
  if (s.status !== 200) return json(s.status, { ok: false, reason: s.reason })
  if (!s.architect) return json(403, { ok: false, reason: "not-architect" })
  const list = elementsOfNode()
  return list ? json(200, { ok: true, elements: list }) : json(500, { ok: false, reason: "registry-unreadable" })
}
