import { type ReactNode, type ReactElement } from 'react'
import styles from './tooltip.module.css'

export interface TooltipProps {
  content: ReactNode
  children: ReactElement
  position?: 'top' | 'bottom'
  align?: 'center' | 'start' | 'end'
  className?: string
  id?: string
}

export function Tooltip({
  content,
  children,
  position = 'bottom',
  align = 'center',
  className,
  id
}: TooltipProps) {
  if (!content) return children

  const positionClass = position === 'top' ? styles.positionTop : styles.positionBottom
  const alignClass =
    align === 'start' ? styles.alignStart : align === 'end' ? styles.alignEnd : styles.alignCenter

  return (
    <span className={`${styles.tooltipWrapper} ${className ?? ''}`.trim()}>
      {children}
      <span
        role='tooltip'
        id={id}
        data-testid='tooltip'
        className={`${styles.tooltip} ${positionClass} ${alignClass}`}
      >
        <span className={styles.arrow} aria-hidden='true' />
        <span className={styles.text}>{content}</span>
      </span>
    </span>
  )
}
