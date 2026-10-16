import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createI18n } from '../../i18n'
import { AppProviders } from './AppProviders'
import { PopupLayout } from './PopupLayout'
import { PageLayout } from './PageLayout'
import { OptionsLayout } from './OptionsLayout'

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

  it('renders PopupLayout with navBar, pinnedBanner, and toastHost slots', () => {
    render(
      <AppProviders i18n={i18n}>
        <PopupLayout
          title='English Reading Assistant'
          navBar={<div>Horizontal NavBar Tabs</div>}
          pinnedBanner={<div>Today Stats Banner</div>}
          toastHost={<div>Toast Message</div>}
        >
          <div>Word List Content</div>
        </PopupLayout>
      </AppProviders>
    )

    expect(screen.getByText('Horizontal NavBar Tabs')).toBeInTheDocument()
    expect(screen.getByText('Today Stats Banner')).toBeInTheDocument()
    expect(screen.getByText('Word List Content')).toBeInTheDocument()
    expect(screen.getByText('Toast Message')).toBeInTheDocument()
  })

  it('renders OptionsLayout with sidebar categories and content pane', () => {
    const categories = [
      { id: 'general', label: 'Cài đặt chung' },
      { id: 'translate', label: 'Tra từ & Dịch' }
    ]
    let selectedId = 'general'
    const onSelect = (id: string) => {
      selectedId = id
    }

    const { rerender } = render(
      <AppProviders i18n={i18n}>
        <OptionsLayout
          title='Cài đặt'
          description='Tùy chỉnh tiện ích'
          categories={categories}
          activeCategory={selectedId}
          onSelectCategory={onSelect}
        >
          <div>Nội dung chung</div>
        </OptionsLayout>
      </AppProviders>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cài đặt')
    expect(screen.getByText('Tùy chỉnh tiện ích')).toBeInTheDocument()
    expect(screen.getByText('Cài đặt chung')).toBeInTheDocument()
    expect(screen.getByText('Tra từ & Dịch')).toBeInTheDocument()
    expect(screen.getByText('Nội dung chung')).toBeInTheDocument()

    // Test selection
    const translateBtn = screen.getByRole('button', { name: /Tra từ & Dịch/i })
    translateBtn.click()
    expect(selectedId).toBe('translate')

    rerender(
      <AppProviders i18n={i18n}>
        <OptionsLayout
          title='Cài đặt'
          description='Tùy chỉnh tiện ích'
          categories={categories}
          activeCategory='translate'
          onSelectCategory={onSelect}
        >
          <div>Nội dung tra từ</div>
        </OptionsLayout>
      </AppProviders>
    )

    expect(translateBtn).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Nội dung tra từ')).toBeInTheDocument()
  })
})
