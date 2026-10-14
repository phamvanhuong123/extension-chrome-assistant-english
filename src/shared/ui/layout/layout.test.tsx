import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createI18n } from '../../i18n'
import { AppProviders } from './AppProviders'
import { PopupLayout } from './PopupLayout'
import { PageLayout } from './PageLayout'

describe('Layout Components (shared/ui/layout)', () => {
  const i18n = createI18n({
    vi: { 'app.title': 'Trợ lý đọc tiếng Anh' },
    en: { 'app.title': 'English Reading Assistant' }
  })

  it('renders PopupLayout with title and children', () => {
    render(
      <AppProviders i18n={i18n}>
        <PopupLayout title='My Popup Title'>
          <p>Popup Body Content</p>
        </PopupLayout>
      </AppProviders>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Popup Title')
    expect(screen.getByText('Popup Body Content')).toBeInTheDocument()
  })

  it('renders PageLayout with header and description', () => {
    render(
      <AppProviders i18n={i18n}>
        <PageLayout title='Settings' description='Manage your preferences'>
          <div>Page content</div>
        </PageLayout>
      </AppProviders>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Settings')
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })
})
