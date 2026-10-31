import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  isIconOnly?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  isIconOnly = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || isLoading)

  const variantClass = styles[variant] ?? styles.secondary
  const sizeClass = styles[size] ?? styles.md
  const iconOnlyClass = isIconOnly ? styles.iconOnly : ''
  const loadingClass = isLoading ? styles.loading : ''
  const disabledClass = isDisabled ? styles.disabled : ''

  const combinedClass = [styles.button, variantClass, sizeClass, iconOnlyClass, loadingClass, disabledClass, className]
    .filter(Boolean)
    .join(' ')

  const spinnerElement = <Spinner size={14} />

  let renderedLeftIcon: ReactNode = null
  if (isLoading) {
    renderedLeftIcon = <span className={styles.iconSlot}>{spinnerElement}</span>
  } else if (leftIcon) {
    renderedLeftIcon = <span className={styles.iconSlot}>{leftIcon}</span>
  }

  const renderedRightIcon = rightIcon && !isLoading ? <span className={styles.iconSlot}>{rightIcon}</span> : null

  return (
    <button
      type={type}
      className={combinedClass}
      disabled={isDisabled}
      aria-busy={isLoading ? 'true' : undefined}
      {...rest}
    >
      {isIconOnly ? (
        isLoading ? (
          spinnerElement
        ) : (
          children
        )
      ) : (
        <>
          {renderedLeftIcon}
          {children && <span>{children}</span>}
          {renderedRightIcon}
        </>
      )}
    </button>
  )
}
