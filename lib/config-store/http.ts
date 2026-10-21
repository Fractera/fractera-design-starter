// 549-1: ответы дверей config — те же заголовки, что у прежнего node:http-сервера (server.js v0.2.26: `json()`).
export const HEADERS = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "no-store" }

export const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: HEADERS })

/** Заголовки запроса объектом в нижнем регистре — форма, которую ждут перенесённые модули (`keyOk`, `sessionOf`). */
export function headersOf(req: Request): Record<string, string> {
  const out: Record<string, string> = {}
  req.headers.forEach((v, k) => { out[k.toLowerCase()] = v })
  return out
}
