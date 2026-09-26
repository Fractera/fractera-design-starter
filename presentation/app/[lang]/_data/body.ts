// СЛОВА ГЛАВНОЙ СТРАНИЦЫ ЭЛЕМЕНТА «ДИЗАЙН» (шаг 309). Сборка в блоки — `../_components/index.tsx`.
// Раскладка — как у «Блоков» и CONFIG: первый экран по центру, ряд мер, ярлыки, карточки разделов, три шага, вопросы.

export type ConfigHomeWords = {
  title: string
  description: string
  /** Первый экран по центру — короткий заголовок (до ~36 знаков), бейдж и три шага. */
  heroTitle: string
  pill: string
  heroSteps: [{ title: string; text: string }, { title: string; text: string }, { title: string; text: string }]
  cta: string
  faqTitle: string
  faq: [{ q: string; a: string }, { q: string; a: string }, { q: string; a: string }]
  metrics: { value: string; label: string }[]
  badges: string[]
  groups: { badge: string; title: string; note: string; items: { title: string; text: string }[] }
  flow: { badge: string; title: string; note: string; steps: [{ title: string; text: string }, { title: string; text: string }, { title: string; text: string }] }
}

const en: ConfigHomeWords = {
  title: 'Fractera Design — the look of every service in one place',
  heroTitle: 'One design for the whole project',
  pill: 'Agentic engineering infrastructure',
  heroSteps: [
    { title: 'Choose', text: 'Colours, fonts, shapes and spacing on one screen' },
    { title: 'Save', text: 'Every service of the project gets a signal at once' },
    { title: 'See', text: 'Each one re-styles itself in seconds, without a rebuild' },
  ],
  description: 'A standalone microservice that keeps the design of your project — colours for the light and dark theme, fonts, text scale, corner radius, spacing and block settings — and hands it to every service of the project the moment you save.',
  cta: 'Open the design',
  faqTitle: 'Frequently asked questions',
  faq: [
    { q: 'Which services follow the design?', a: 'Every service of the project that subscribes to it: the site, sign-in, data, blocks, project settings and this element itself. A service without the Design element keeps its own theme and runs as before.' },
    { q: 'Does a change need a rebuild?', a: 'No. Pages stay static and fast: when you save, each service takes the new design over MCP and re-renders its pages once, in seconds. Visitors see the change after reloading the page.' },
    { q: 'Who can change the design?', a: 'Only the architect of the project, after signing in. Everyone else sees this page and nothing more; services read the design with the key of the node.' },
  ],
  metrics: [
    { value: '13', label: 'colour roles for each theme' },
    { value: '3', label: 'font roles: headings, text, code' },
    { value: '6', label: 'services re-styled by one save' },
  ],
  badges: ['MCP', 'DESIGN-CONFIG', 'Light and dark theme', 'Google Fonts', 'Claude Code Agent'],
  groups: {
    badge: 'What you design',
    title: 'Five sections, each on its own page',
    note: 'Open a section, change what you need, save. Every service of the project follows at once.',
    items: [
      { title: 'Colours — light theme', text: 'Primary, background, text, borders, accents and the chart palette.' },
      { title: 'Colours — dark theme', text: 'The same roles for visitors who prefer the dark theme.' },
      { title: 'Fonts', text: 'Fonts for headings, body text and code — any font from Google Fonts.' },
      { title: 'Text, shapes and spacing', text: 'Text scale and line height, corner radius, borders, spacing and page width.' },
      { title: 'Blocks', text: 'The width and the title sizes of the centered first screen on phone, tablet and computer.' },
    ],
  },
  flow: {
    badge: 'How it works',
    title: 'Change once — the whole project follows',
    note: 'No theme files scattered across repositories, no rebuild for a colour.',
    steps: [
      { title: 'Change', text: 'The architect changes the design on this screen and saves it. Design keeps it.' },
      { title: 'Signal', text: 'The moment you save, every subscribed service gets a signal and takes the new design itself over MCP.' },
      { title: 'See', text: 'Each service re-renders its pages with the new design in seconds — static, fast, without a rebuild.' },
    ],
  },
}

const ru: ConfigHomeWords = {
  title: 'Fractera Design — оформление всех служб в одном месте',
  heroTitle: 'Один дизайн на весь проект',
  pill: 'Инфраструктура агентной инженерии',
  heroSteps: [
    { title: 'Выберите', text: 'Цвета, шрифты, скругления и отступы на одном экране' },
    { title: 'Сохраните', text: 'Каждая служба проекта сразу получает сигнал' },
    { title: 'Смотрите', text: 'Каждая перекрашивается за секунды, без пересборки' },
  ],
  description: 'Самостоятельный микросервис, который хранит оформление вашего проекта — цвета светлой и тёмной темы, шрифты, масштаб текста, скругления, отступы и настройки блоков — и передаёт его каждой службе проекта в момент сохранения.',
  cta: 'Открыть дизайн',
  faqTitle: 'Частые вопросы',
  faq: [
    { q: 'Какие службы следуют дизайну?', a: 'Каждая служба проекта, которая на него подписана: сайт, вход, данные, блоки, настройки проекта и сам этот элемент. Служба без элемента «Дизайн» живёт своей темой, как раньше.' },
    { q: 'Нужна ли пересборка после правки?', a: 'Нет. Страницы остаются статическими и быстрыми: в момент сохранения каждая служба забирает новый дизайн по MCP и один раз перерисовывает свои страницы — за секунды. Посетитель видит изменение после обновления страницы.' },
    { q: 'Кто может менять дизайн?', a: 'Только архитектор проекта после входа. Остальные видят эту страницу и ничего больше; службы читают дизайн ключом узла.' },
  ],
  metrics: [
    { value: '13', label: 'ролей цвета для каждой темы' },
    { value: '3', label: 'роли шрифта: заголовки, текст, код' },
    { value: '6', label: 'служб перекрашивает одно сохранение' },
  ],
  badges: ['MCP', 'DESIGN-CONFIG', 'Светлая и тёмная тема', 'Google Fonts', 'Claude Code Agent'],
  groups: {
    badge: 'Что вы оформляете',
    title: 'Пять разделов, у каждого своя страница',
    note: 'Откройте раздел, поменяйте нужное, сохраните. Все службы проекта последуют сразу.',
    items: [
      { title: 'Цвета — светлая тема', text: 'Основной, фон, текст, рамки, акценты и палитра диаграмм.' },
      { title: 'Цвета — тёмная тема', text: 'Те же роли для посетителей, которые выбрали тёмную тему.' },
      { title: 'Шрифты', text: 'Шрифты заголовков, основного текста и кода — любой шрифт из Google Fonts.' },
      { title: 'Текст, формы и отступы', text: 'Масштаб текста и интервал, скругление, рамки, отступы и ширина страницы.' },
      { title: 'Блоки', text: 'Ширина и размеры заголовка первого экрана по центру на телефоне, планшете и компьютере.' },
    ],
  },
  flow: {
    badge: 'Как это работает',
    title: 'Поменяли один раз — весь проект следует',
    note: 'Никаких файлов темы по разным репозиториям и никакой пересборки ради цвета.',
    steps: [
      { title: 'Поменять', text: 'Архитектор меняет дизайн на этом экране и сохраняет. «Дизайн» его хранит.' },
      { title: 'Сигнал', text: 'В момент сохранения каждая подписанная служба получает сигнал и сама забирает новый дизайн по MCP.' },
      { title: 'Увидеть', text: 'Каждая служба перерисовывает свои страницы с новым дизайном за секунды — статично, быстро, без пересборки.' },
    ],
  },
}

const WORDS: Record<string, ConfigHomeWords> = { en, ru }

export function configHomeWords(lang: string): ConfigHomeWords {
  return WORDS[lang] ?? en
}

export const LANGS = Object.keys(WORDS)
