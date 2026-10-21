// 549-2: слова и параметры блока страницы «_index» прежнего design (content/architect/_index/<язык>.json) — дословно.
export const P_overview = {
  "en": {
    "section": "fonts",
    "words": {
      "loading": "Loading the settings…",
      "signin": "Sign in as the architect of the project to see and change the settings.",
      "signinLink": "Sign in",
      "forbidden": "You are signed in, but only the architect of the project can see and change these settings.",
      "unavailable": "The sign-in service is not answering right now — try again in a minute.",
      "error": "The settings could not be read. Nothing was changed."
    }
  },
  "ru": {
    "section": "fonts",
    "words": {
      "loading": "Загружаю настройки…",
      "signin": "Войдите как архитектор проекта, чтобы видеть и менять настройки.",
      "signinLink": "Войти",
      "forbidden": "Вы вошли, но видеть и менять эти настройки может только архитектор проекта.",
      "unavailable": "Служба входа сейчас не отвечает — попробуйте через минуту.",
      "error": "Настройки не удалось прочитать. Ничего не изменено."
    }
  }
} as const

export const configPageProps = (lang: string) => (lang === "ru" ? P_overview.ru : P_overview.en)
