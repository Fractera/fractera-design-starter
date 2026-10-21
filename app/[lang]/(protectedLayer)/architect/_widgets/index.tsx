import type { ReactNode } from 'react'
import { Widget as W0 } from './dynamic/widget-dynamic-design-colors'
import { Widget as W1 } from './dynamic/widget-dynamic-design-shape'
import { Widget as W2 } from './dynamic/widget-dynamic-design-type'
import { Widget as W3 } from './dynamic/widget-dynamic-design-overview'

// 549-2: страницы режима архитектора элемента design — по виджету на страницу прежнего design.
export const WIDGETS: Record<string, (lang: string) => ReactNode> = {
  'widget-dynamic-design-colors': (lang) => <W0 lang={lang} />,
  'widget-dynamic-design-shape': (lang) => <W1 lang={lang} />,
  'widget-dynamic-design-type': (lang) => <W2 lang={lang} />,
  'widget-dynamic-design-overview': (lang) => <W3 lang={lang} />,
}
