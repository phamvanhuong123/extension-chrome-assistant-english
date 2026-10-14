import type { ReactNode } from 'react'
import styles from './layout.module.css'

export interface PageLayoutProps {
  title?: ReactNode
  description?: ReactNode
  headerActions?: ReactNode
  className?: string
  children: ReactNode
}

export function PageLayout({ title, description, headerActions, className, children }: PageLayoutProps) {
  return (
    <div className={`${styles.pageContainer} ${className ?? ''}`.trim()}>
      <div className={styles.pageInner}>
        {(title || description || headerActions) && (
          <header className={styles.pageHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {title && <h1 className={styles.pageTitle}>{title}</h1>}
              {headerActions && <div>{headerActions}</div>}
            </div>
            {description && <p className={styles.pageDescription}>{description}</p>}
          </header>
        )}
        <main>{children}</main>
      </div>
    </div>
  )
}
