// 564: подпись левого меню разделов (en и ru; остальные — английский).
const TITLE: Record<string, string> = { en: "Settings sections", ru: "Разделы настроек" }
export const sectionMenuTitle = (lang: string) => TITLE[lang] ?? TITLE.en
