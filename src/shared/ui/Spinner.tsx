import type { SVGAttributes } from 'react'
import styles from './Spinner.module.css'

export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
  size?: number
  label?: string
  className?: string
}

export function Spinner({ size = 14, label, className, ...rest }: SpinnerProps) {
  const isAccessible = Boolean(label)

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='3'
      className={`${styles.spinner} ${className ?? ''}`.trim()}
      role={isAccessible ? 'status' : undefined}
      aria-label={label}
      aria-hidden={!isAccessible ? 'true' : undefined}
      {...rest}
    >
      <circle className={styles.track} cx='12' cy='12' r='9' stroke='currentColor' />
      <circle
        className={styles.indicator}
        cx='12'
        cy='12'
        r='9'
        stroke='currentColor'
        strokeDasharray='56.5'
        strokeDashoffset='42'
        strokeLinecap='round'
      />
    </svg>
  )
}
