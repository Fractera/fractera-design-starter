// @api read or change one kind of project settings in config
import { settingsDoor } from "@/lib/config-store/settings-door"

// 549-1: прежняя дверь config `/api/settings/<app|platform|design>`; чужой вид — 404 `unknown-kind`. `/api/settings/changed` —
// отдельная папка шаблона (сигнал перерисовки), она сильнее этого маршрута.
export const dynamic = "force-dynamic"
type Ctx = { params: Promise<{ kind: string }> }
export const GET = async (req: Request, ctx: Ctx) => settingsDoor(req, (await ctx.params).kind)
export const PATCH = async (req: Request, ctx: Ctx) => settingsDoor(req, (await ctx.params).kind)
