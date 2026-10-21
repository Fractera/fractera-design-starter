// 549-2: слова тостера редакторов design — те же, что прежний config ставил в макете (`presentation/app/[lang]/layout.tsx`).
const WORDS = {
  en: { deployLabel: "Open deployments", closeLabel: "Close" },
  ru: { deployLabel: "Открыть развёртывания", closeLabel: "Закрыть" },
} as const

export const toasterWords = (lang: string) => (lang === "ru" ? WORDS.ru : WORDS.en)
