import type { ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipContent } from './components/TooltipContent'
import { TooltipActions } from './components/TooltipActions'
import { TooltipError } from './components/TooltipError'
import { createI18n, I18nProvider } from '@/shared/i18n'
import { vi as translateVi } from '../locales/vi'
import { en as translateEn } from '../locales/en'

const testI18n = createI18n({
  vi: translateVi,
  en: translateEn
})

function renderWithI18n(ui: ReactNode) {
  return render(<I18nProvider i18n={testI18n}>{ui}</I18nProvider>)
}

describe('Tooltip UI Components (FR-01, FR-02, FR-03)', () => {
  describe('TooltipContent', () => {
    it('renders original text, phonetic, part of speech, and translation', () => {
      renderWithI18n(
        <TooltipContent
          word='ubiquitous'
          translation='có mặt ở khắp nơi'
          phonetic='/juːˈbɪkwɪtəs/'
          partOfSpeech='adjective'
        />
      )

      expect(screen.getByTestId('tooltip-headword')).toHaveTextContent('ubiquitous')
      expect(screen.getByTestId('tooltip-phonetic')).toHaveTextContent('/juːˈbɪkwɪtəs/')
      expect(screen.getByTestId('tooltip-pos')).toHaveTextContent('adjective')
      expect(screen.getByTestId('tooltip-translation')).toHaveTextContent('có mặt ở khắp nơi')
    })

    it('omits phonetic and part of speech when not provided', () => {
      renderWithI18n(<TooltipContent word='hello' translation='xin chào' />)

      expect(screen.getByTestId('tooltip-headword')).toHaveTextContent('hello')
      expect(screen.getByTestId('tooltip-translation')).toHaveTextContent('xin chào')
      expect(screen.queryByTestId('tooltip-meta')).toBeNull()
    })
  })

  describe('TooltipActions', () => {
    it('renders save button in unsaved state and triggers onSave callback', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()

      renderWithI18n(<TooltipActions saveState='unsaved' onSave={onSave} />)

      const saveBtn = screen.getByRole('button', { name: /lưu/i })
      expect(saveBtn).toBeInTheDocument()

      await user.click(saveBtn)
      expect(onSave).toHaveBeenCalledOnce()
    })

    it('renders saved chip when word is saved', () => {
      renderWithI18n(<TooltipActions saveState='saved' onSave={vi.fn()} />)

      expect(screen.getByTestId('tooltip-saved-chip')).toHaveTextContent(/đã lưu/i)
      expect(screen.queryByRole('button', { name: /lưu/i })).toBeNull()
    })

    it('shows disabled saving state when saving', () => {
      renderWithI18n(<TooltipActions saveState='saving' onSave={vi.fn()} />)

      const saveBtn = screen.getByTestId('tooltip-save-btn')
      expect(saveBtn).toBeDisabled()
      expect(saveBtn).toHaveTextContent(/đang lưu/i)
    })
  })

  describe('TooltipError', () => {
    it('renders mapped error message and retry button when retryable is true', async () => {
      const user = userEvent.setup()
      const onRetry = vi.fn()

      renderWithI18n(<TooltipError code='NETWORK_ERROR' retryable={true} onRetry={onRetry} />)

      expect(screen.getByRole('alert')).toHaveTextContent(/kết nối mạng/i)
      const retryBtn = screen.getByRole('button', { name: /thử lại/i })
      expect(retryBtn).toBeInTheDocument()

      await user.click(retryBtn)
      expect(onRetry).toHaveBeenCalledOnce()
    })

    it('omits retry button when retryable is false', () => {
      renderWithI18n(<TooltipError code='VALIDATION_ERROR' retryable={false} onRetry={vi.fn()} />)

      expect(screen.getByRole('alert')).toHaveTextContent(/tối đa 100 ký tự/i)
      expect(screen.queryByRole('button', { name: /thử lại/i })).toBeNull()
    })
  })
})
