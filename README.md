# Fractera Design — the shared look of the node

This element keeps the **design of the whole node** — colours of the light and dark theme, fonts, type, shapes and block settings —
and gives it to every element. Since **v1.0.0** (node step 549-2) it is built on the Fractera native element template; its doors did
not change.

| Door | What it does |
|---|---|
| `GET /health` | `{ ok, service: "design", version }` for the node watcher |
| `POST /mcp` | MCP, stateless: `describe_config`, `settings_version`, `get_project_settings`, `subscribe` (node key in `X-Settings-Key`) |
| `GET /api/settings`, `GET /api/settings/design` | the design — the node key or the architect session |
| `PATCH /api/settings/design` | the architect writes a patch; every subscribed address gets `POST {version}` with `X-Settings-Key` |
| `GET /api/elements`, `/api/session` | the architect's helpers of the editors |
| `/<lang>/architect/*` | the editors: overview, colours, type, shape |

Where it lives: server modules `lib/config-store/`, editors `app/[lang]/(protectedLayer)/architect/_components/design-editors/`, one widget
per page in `architect/_widgets/dynamic/widget-dynamic-design-*`. Defaults — `settings/design/defaults.json`; the owner patch and the
subscribers — `data/settings/` (never in git).

---

## In the Fractera project

The shared look of the node: colours of both themes, fonts, type, shapes and block settings. Every element that follows Design takes them from it and redraws its pages when it signals a new version.

You can change it. The code is open under the MIT license and the copy on your node is yours. The node installs this element from
this repository by the tag written in `WEB4-ITEMS-REGISTRY/web4-items.json` of the core; the core does not let you delete a built-in
element or move its address.

To change it, open it in the core (left menu, Native items, Design), go to Build and tell its agent in the terminal what you need.
The agent edits the element folder `WEB4-ITEMS/core/design` and commits. The look itself is set on the element's settings pages, not in code.

The change goes live when you press Deploy in Build, Deployments: the element is rebuilt beside the running one and switched over in
seconds. Other elements call its doors by address, request and answer, so a change to a door breaks every element that uses it;
that is a decision for the node owner, while a change inside the element is ordinary work. To keep your version when the node is
reinstalled, save the element to your own GitHub repository in Build, GitHub. A newer Fractera version arrives through Update, which
merges it with your commits, and the element's agent resolves a conflict.

# fractera-native-item-starter

The reference starter template of a Fractera native element. Native elements are the root elements of a node: they stand on
every node, they come only from the Fractera repository, and they are never sold and never join an outside network. They serve
the person and the other elements of their own node. Custom elements are born from `fractera-custom-item-starter` by the node's
button «Create WEB4 ITEM»; native ones are added from here.

The template is the custom reference template without the network parts: no showcase or Nostr fields in the passport
(`visibility: node`, `messengers: { h2a: true, h2h: false, a2a: false }`), no messenger between people, no work for outside agents
and no order summaries. The home page shows one line, «Reference native template», and the yellow starter sign.

## The contract a replacement must keep

- `OWN-SERVICE-PROPS/` — the passport, the element's main door (`GET /api/own-service-props`); `NODE-CONTRACT.json` — what the node needs to install it.
- The port comes from the `PORT` environment variable.
- `GET /api/health` answers 200 without a session.
- Sign-in only through the node's auth element; stored data only through the node's data element.
- Public pages stay static.

A repository that does not keep this contract is refused; the node does not bend to it.

## Run on its own

```
npm install
npm run build
PORT=24683 node .next/standalone/server.js
```

License: MIT.
