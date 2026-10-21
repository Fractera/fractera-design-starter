import { DesignEditorBlock } from "../../../_components/design-editors/blocks"
import { configPageProps } from "./words.i18n"

// 549-2: страница «shape» прежнего design — тот же блок `designEditor` с теми же словами.
export function Widget({ lang }: { lang: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DesignEditorBlock lang={lang} {...(configPageProps(lang) as any)} />
}
