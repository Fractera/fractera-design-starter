import { rootPage } from '@/lib/branch-page'
import { WIDGETS } from './_widgets'

// Корень ветки «architect» — /<lang>/architect (549-1, режим архитектора config). Слова — ./_data; дети — ./_pages/<slug>/, их рисует ./[slug].
const page = rootPage({ segments: ['(protectedLayer)', 'architect'], subPath: '/architect', widgets: WIDGETS })

export const revalidate = 300
export const generateMetadata = page.generateMetadata
export default page.Page
