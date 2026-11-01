import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/shared/ui/layout'
import { createI18n } from '@/shared/i18n'
import { ContentApp } from '@/features/translate/content'
import tokens from '@/shared/ui/tokens.css?inline'
import contentStyles from './content.css?inline'
import tooltipStyles from '@/features/translate/content/components/tooltip.module.css?inline'
import skeletonStyles from '@/shared/ui/Skeleton.module.css?inline'
import { vi as translateVi } from '@/features/translate/locales/vi'
import { en as translateEn } from '@/features/translate/locales/en'
import { vi as vocabVi } from '@/features/vocabulary/locales/vi'
import { en as vocabEn } from '@/features/vocabulary/locales/en'

if (!document.querySelector('[data-era-root]')) {
  const host = document.createElement('div')
  host.setAttribute('data-era-root', '')
  host.style.cssText = 'position:fixed;inset:0 auto auto 0;z-index:2147483647;pointer-events:none'

  const shadow = host.attachShadow({ mode: 'open' })
  const styleEl = document.createElement('style')
  styleEl.textContent = `:host{all:initial}${tokens}${contentStyles}${tooltipStyles}${skeletonStyles}`
  const appDiv = document.createElement('div')
  appDiv.id = 'era-app'

  shadow.appendChild(styleEl)
  shadow.appendChild(appDiv)
  document.documentElement.appendChild(host)

  const i18n = createI18n({
    vi: { ...translateVi, ...vocabVi },
    en: { ...translateEn, ...vocabEn }
  })

  createRoot(appDiv).render(
    <AppProviders i18n={i18n} targetElement={shadow.host as HTMLElement}>
      <ContentApp />
    </AppProviders>
  )
}
