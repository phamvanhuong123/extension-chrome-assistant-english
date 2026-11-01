import styles from './tooltip.module.css'
import { useT } from '@/shared/i18n'
import type { SaveState } from '../hooks/useSaveWord'

export interface TooltipActionsProps {
  saveState: SaveState
  onSave: () => void
}

export function TooltipActions({ saveState, onSave }: TooltipActionsProps) {
  const { t } = useT()

  const isSaved = saveState === 'saved'
  const isSaving = saveState === 'saving' || saveState === 'checking'
  const isError = saveState === 'error'

  return (
    <div className={styles.actions} data-testid='tooltip-actions'>
      {isSaved ? (
        <div className={styles.savedChip} role='status' data-testid='tooltip-saved-chip'>
          <span>{t('translate.tooltip.saved')}</span>
        </div>
      ) : (
        <button
          type='button'
          className={styles.saveBtn}
          onClick={onSave}
          disabled={isSaving}
          aria-label={t('translate.tooltip.save')}
          data-testid='tooltip-save-btn'
          onMouseDown={(e) => e.preventDefault()}
        >
          {isSaving ? t('translate.tooltip.saving') : t('translate.tooltip.save')}
        </button>
      )}

      {isError && (
        <span className={styles.saveError} role='alert' data-testid='tooltip-save-error'>
          {t('translate.tooltip.saveError')}
        </span>
      )}

      <span className={styles.escHint} aria-hidden='true'>
        Esc
      </span>
    </div>
  )
}

