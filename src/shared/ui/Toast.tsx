import { useEffect, type ReactNode } from 'react'
import styles from './Toast.module.css'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastProps {
  id?: string
  message: ReactNode
  action?: ToastAction
  duration?: number
  onDismiss?: () => void
  className?: string
}

export function Toast({ id, message, action, duration = 5000, onDismiss, className }: ToastProps) {
  useEffect(() => {
    if (duration <= 0 || !onDismiss) return

    const timer = setTimeout(() => {
      onDismiss()
    }, duration)

    return () => {
      clearTimeout(timer)
    }
  }, [duration, onDismiss])

  const handleActionClick = () => {
    action?.onClick()
    onDismiss?.()
  }

  return (
    <div id={id} role='status' aria-live='polite' className={`${styles.toast} ${className ?? ''}`.trim()}>
      <div className={styles.message}>{message}</div>
      {action && (
        <button type='button' className={styles.actionButton} onClick={handleActionClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
