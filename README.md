# Fractera Design — the design of the project as its own element

An AGI ITEM of the node (step 309, owner 2026-09-26): «создать отдельный полностью микро сервис такой же как у блок … любые
микро сервисы … будут менять свой дизайн … в тот момент когда микро сервис дизайн будет вносить изменения».

## What it gives

One place for the look of the whole project — colours of the light and dark theme (13 roles each), fonts for headings,
text and code, text scale and line height, corner radius, borders, spacing, page widths and block settings (the centered
first screen). The architect saves — every subscribed service of the node re-styles itself in seconds, without a rebuild.

## Where it lives

| Part | Here |
|---|---|
| passport | `OWN-SERVICE-PROPS.json` (port wish 24686, health `/health`) |
| store | `data/settings/design.json` — the owner decisions; defaults `settings/design/defaults.json` |
| doors | `GET /api/settings/design` (node key or architect), `PATCH /api/settings/design` (architect only) |
| MCP | `/mcp`: `describe_config`, `settings_version`, `get_project_settings` (kind `design`), `subscribe` |
| signal | after every save — `POST {version}` with `X-Settings-Key` to every subscriber (`subscribers.js`) |
| editor | `/<lang>/architect` (fonts), `/type`, `/shape`, `/colors` — the four editors of the core original (aifa.dev/ru/architect/design): choice on the left, sticky preview on the right, ten ready colour sets; behind the architect gate |
| public page | `/en`, `/ru` |

## Install

The node installer (`npm run services:install -- --only design`) with the entry in `AGI-ITEMS-CONFIG/agi-items.json`.
Environment (`.env.example`): `PORT`, `SETTINGS_SECRET` (the node key), `AUTH_SERVICE_URL` (architect gate),
`DESIGN_SERVICE_URL` (itself — the element follows its own design like every other service).
At birth, seed it from the site once, so the first pull does not reset the project to the default theme:

```
node scripts/seed-from-site.mjs <site folder>     # copies DESIGN-CONFIG/design-config.json of the site; never overwrites
```

## Connect a service

Copy the three pieces every service of the node carries (`fractera-root-starter` is the reference):

```ts
// lib/design-follow.ts — pullDesign(), subscribeToDesign(who), signalKeyOk()
// app/api/settings/changed/route.ts
export async function POST(req: NextRequest) {
  if (!signalKeyOk(req.headers.get("x-settings-key"))) return NextResponse.json({ ok: false }, { status: 401 })
  const r = await pullDesign()          // writes the design into the service's own DESIGN-CONFIG
  revalidatePath("/", "layout")        // re-render on every keyed signal
  return NextResponse.json(r)
}
// instrumentation.ts — at start: pullDesign(), then subscribeToDesign("<id>")
```

The service's `design-config.ts` reads its `DESIGN-CONFIG` file at render and `design-css.ts` writes the CSS variables
(`--primary`, `--radius`, `--font-heading`, `--type-scale`, `--hero-one-w`, …). Set `DESIGN_SERVICE_URL` in its env.

## Extend

A new design setting = a field in `presentation/lib/settings/fields.ts` (a section of kind `design`), its label in
`presentation/components/settings/fields.i18n.ts`, the key in `settings/design/defaults.json` and `schema.json`, and the
CSS variable in every service's `lib/design-css.ts`. Values outside the safe bounds are ignored by the services.

## What it does not do

Change the CODE of blocks (that needs a rebuild of the service that owns the copy); refresh an open browser tab; deliver
to services on another machine.

## Remove

Uninstall the element; services keep the last design in their own `DESIGN-CONFIG` and live on.

## Proven by

`probe-309` (isolated): a save of `colors.light.primary`, `shape.radius`, `fonts.heading.family` changed the root page
HTML with the same process; a signal without the key → 401; removing the decisions removed the values. Live on the node —
step 309-5.
