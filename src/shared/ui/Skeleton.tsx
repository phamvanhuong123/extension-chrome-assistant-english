import type { HTMLAttributes, CSSProperties } from 'react'
import styles from './Skeleton.module.css'

export type SkeletonVariant = 'text' | 'rect' | 'circle'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
  style?: CSSProperties
}

export function Skeleton({ variant = 'text', width, height, borderRadius, className, style, ...rest }: SkeletonProps) {
  const variantClass = styles[variant] ?? styles.text

  const customStyle: CSSProperties = {
    ...style
  }

  if (width !== undefined) {
    customStyle.width = typeof width === 'number' ? `${width}px` : width
  }

  if (height !== undefined) {
    customStyle.height = typeof height === 'number' ? `${height}px` : height
  }

  if (borderRadius !== undefined) {
    customStyle.borderRadius = borderRadius
  }

  if (variant === 'circle' && width !== undefined && height === undefined) {
    customStyle.height = customStyle.width
  }

  return (
    <div
      className={`${styles.skeleton} ${variantClass} ${className ?? ''}`.trim()}
      style={customStyle}
      aria-hidden='true'
      {...rest}
    />
  )
}
