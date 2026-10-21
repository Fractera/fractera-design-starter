// @api read all project settings kept by the config element
import { settingsDoor } from "@/lib/config-store/settings-door"

// 549-1: прежняя дверь config `/api/settings` — все три вида (ключ служб или архитектор).
export const dynamic = "force-dynamic"
export const GET = (req: Request) => settingsDoor(req, null)
export const PATCH = (req: Request) => settingsDoor(req, null)
