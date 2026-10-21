import { AccessGate } from "@/components/auth/access-gate.client"
import { PROTECTED_GROUP_ROLES } from "@/lib/roles"
import { accessGateUi } from "@/components/auth/access-gate.i18n"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { branchChildren, branchRoot, wordsIn } from "@/lib/page-tree"
import { SettingsToaster } from "./_components/design-editors/toast"
import { toasterWords } from "./_components/toaster.i18n"
import { SectionMenu, type SectionItem } from "./_components/section-menu.client"
import { sectionMenuTitle } from "./_components/section-menu.i18n"

const ARCHITECT = (process.env.ARCHITECT_URL ?? "").replace(/\/+$/, "")

const BRANCH = ["(protectedLayer)", "architect"]

// 565 (владелец 2026-10-21: «Да, такое же меню»): левое меню разделов — главная ветки и её дети из _pages/ по meta.order, как у config.
function sections(lang: string): SectionItem[] {
  const root = branchRoot(...BRANCH)
  const items: SectionItem[] = root ? [{ href: `/${lang}/architect`, label: wordsIn(root, lang).title }] : []
  for (const p of branchChildren(...BRANCH)) items.push({ href: `/${lang}/architect/${p.slug}`, label: wordsIn(p, lang).title })
  return items
}

// 549-2: замок режима архитектора элемента design — роли `admin` и `architect`, те же, что у прежних ворот design
// (`architect-auth.js`, ARCHITECT_ROLES). Страница остаётся статической: сессию спрашивает островок замка, данные — двери `/api/settings`.
export default async function Layout(
  { children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> },
) {
  const { lang } = await params
  return (
    <AccessGate roles={PROTECTED_GROUP_ROLES.admin} lang={lang} ui={accessGateUi(lang)} dialogUi={appDialogUi(lang)}>
      <div className="flex flex-1 flex-col md:flex-row">
        <SectionMenu items={sections(lang)} title={sectionMenuTitle(lang)} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {/* Сообщения редакторов (сохранено, нужно развёртывание) — как в макете прежнего design. */}
      <SettingsToaster deployHref={ARCHITECT ? `${ARCHITECT}/${lang}/build/deployments` : undefined} {...toasterWords(lang)} />
    </AccessGate>
  )
}
