import { AccessGate } from "@/components/auth/access-gate.client"
import { PROTECTED_GROUP_ROLES } from "@/lib/roles"
import { accessGateUi } from "@/components/auth/access-gate.i18n"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { SettingsToaster } from "./_components/design-editors/toast"
import { toasterWords } from "./_components/toaster.i18n"

const ARCHITECT = (process.env.ARCHITECT_URL ?? "").replace(/\/+$/, "")

// 549-2: замок режима архитектора элемента design — роли `admin` и `architect`, те же, что у прежних ворот design
// (`architect-auth.js`, ARCHITECT_ROLES). Страница остаётся статической: сессию спрашивает островок замка, данные — двери `/api/settings`.
export default async function Layout(
  { children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> },
) {
  const { lang } = await params
  return (
    <AccessGate roles={PROTECTED_GROUP_ROLES.admin} lang={lang} ui={accessGateUi(lang)} dialogUi={appDialogUi(lang)}>
      {children}
      {/* Сообщения редакторов (сохранено, нужно развёртывание) — как в макете прежнего design. */}
      <SettingsToaster deployHref={ARCHITECT ? `${ARCHITECT}/${lang}/build/deployments` : undefined} {...toasterWords(lang)} />
    </AccessGate>
  )
}
