import type { ReactNode } from 'react'
import styles from './layout.module.css'

export interface PopupLayoutProps {
  title?: ReactNode
  headerActions?: ReactNode
  navBar?: ReactNode
  pinnedBanner?: ReactNode
  toastHost?: ReactNode
  footer?: ReactNode
  className?: string
  children: ReactNode
}

export function PopupLayout({
  title = 'English Reading Assistant',
  headerActions,
  navBar,
  pinnedBanner,
  toastHost,
  footer,
  className,
  children
}: PopupLayoutProps) {
  return (
    <div className={`${styles.popupContainer} ${className ?? ''}`.trim()}>
      <header className={styles.popupHeader}>
        <h1 className={styles.popupTitle}>{title}</h1>
        {headerActions && <div>{headerActions}</div>}
      </header>
      {navBar && <nav className={styles.popupNavBar}>{navBar}</nav>}
      {pinnedBanner && <div className={styles.pinnedBanner}>{pinnedBanner}</div>}
      <main className={styles.popupBody}>{children}</main>
      {footer && <footer className={styles.popupFooter}>{footer}</footer>}
      {toastHost && <div className={styles.toastHost}>{toastHost}</div>}
    </div>
  )
}
