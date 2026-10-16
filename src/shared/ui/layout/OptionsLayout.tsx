import type { ReactNode } from 'react'
import styles from './layout.module.css'

export interface OptionCategoryItem {
  id: string
  label: string
  icon?: ReactNode
}

export interface OptionsLayoutProps {
  title?: ReactNode
  description?: ReactNode
  categories: OptionCategoryItem[]
  activeCategory: string
  onSelectCategory: (id: string) => void
  headerActions?: ReactNode
  className?: string
  children: ReactNode
}

export function OptionsLayout({
  title = 'Cài đặt',
  description,
  categories,
  activeCategory,
  onSelectCategory,
  headerActions,
  className,
  children
}: OptionsLayoutProps) {
  return (
    <div className={`${styles.optionsContainer} ${className ?? ''}`.trim()}>
      <div className={styles.optionsInner}>
        <header className={styles.optionsHeader}>
          <div className={styles.optionsHeaderRow}>
            <h1 className={styles.optionsTitle}>{title}</h1>
            {headerActions && <div>{headerActions}</div>}
          </div>
          {description && <p className={styles.optionsDescription}>{description}</p>}
        </header>

        <div className={styles.optionsMasterDetail}>
          <aside className={styles.optionsSidebar}>
            <nav aria-label='Options Categories'>
              <ul className={styles.optionsNavList}>
                {categories.map((cat) => {
                  const isActive = cat.id === activeCategory
                  return (
                    <li key={cat.id}>
                      <button
                        type='button'
                        className={`${styles.optionsNavItem} ${isActive ? styles.optionsNavItemActive : ''}`.trim()}
                        onClick={() => onSelectCategory(cat.id)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {cat.icon && <span className={styles.optionsNavIcon}>{cat.icon}</span>}
                        <span className={styles.optionsNavLabel}>{cat.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          <main className={styles.optionsContentPane}>{children}</main>
        </div>
      </div>
    </div>
  )
}
