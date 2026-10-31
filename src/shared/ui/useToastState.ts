import { useState, useCallback, type ReactNode } from 'react'
import type { ToastAction } from './Toast'

export interface ToastState {
  visible: boolean
  message: ReactNode
  action?: ToastAction
}

export function useToastState() {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' })

  const showToast = useCallback((message: ReactNode, action?: ToastAction) => {
    setToast({ visible: true, message, action })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  return {
    toast,
    showToast,
    hideToast
  }
}
