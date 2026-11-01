import styles from './tooltip.module.css'
import { useT } from '@/shared/i18n'

export interface TooltipErrorProps {
  code: string
  retryable: boolean
  onRetry: () => void
}

export function TooltipError({ code, retryable, onRetry }: TooltipErrorProps) {
  const { t } = useT()
  const errorKey = `translate.errors.${code}`
  const translated = t(errorKey)
  const message = translated !== errorKey ? translated : t('translate.errors.UNKNOWN')

  return (
    <div className={styles.errorBox} role='alert' data-testid='tooltip-error'>
      <span>{message}</span>
      {retryable && (
        <button
          type='button'
          className={styles.retryBtn}
          onClick={onRetry}
          onMouseDown={(e) => e.preventDefault()}
          data-testid='tooltip-retry-btn'
        >
          {t('translate.tooltip.retry')}
        </button>
      )}
    </div>
  )
}
