// @api the MCP of the design element for the node elements
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { configTools } from "@/lib/config-store/mcp-tools.mjs"
import { headersOf } from "@/lib/config-store/http"

// 549-2: MCP прежнего design (тот же каркас, что у config 549-1; (`mcp/serve-mcp.js`) — тот же набор инструментов, тот же режим БЕЗ СЕССИЙ: на каждый запрос свой сервер
// и свой транспорт. Транспорт — веб-стандартный вариант той же библиотеки (маршрут Next получает Request, а не IncomingMessage).
export const dynamic = "force-dynamic"

const VERSION = (() => { try { return JSON.parse(readFileSync(join(process.env.ELEMENT_DIR || process.cwd(), "package.json"), "utf8")).version as string } catch { return "unknown" } })()
const PORT = Number(process.env.PORT) || 24686
const PUBLIC_URL = process.env.SERVICE_PUBLIC_URL || `http://localhost:${PORT}`

type Tool = { name: string; title: string; description: string; inputSchema?: Record<string, unknown>; run: (args: unknown, ctx: { headers: Record<string, string> }) => unknown }

async function handle(req: Request): Promise<Response> {
  const ctx = { headers: headersOf(req) }
  const server = new McpServer({ name: "fractera-design", version: VERSION })
  for (const t of configTools(PUBLIC_URL) as Tool[]) {
    // Типы перегрузок SDK не выражают инструмент, описанный данными (как у прежнего `mcp/serve-mcp.js`): регистрация — без них.
    const register = server.registerTool.bind(server) as unknown as (name: string, meta: object, run: (args: unknown) => Promise<unknown>) => void
    register(t.name, { title: t.title, description: t.description, inputSchema: t.inputSchema }, async (args: unknown) => {
      try {
        const out = await t.run(args ?? {}, ctx)
        return { content: [{ type: "text" as const, text: typeof out === "string" ? out : JSON.stringify(out, null, 2) }] }
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: err instanceof Error ? err.message : String(err) }] }
      }
    })
  }
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  await server.connect(transport)
  return transport.handleRequest(req)
}

export const POST = handle
export const GET = handle
export const DELETE = handle
