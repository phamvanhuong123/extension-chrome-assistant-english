import styles from './tooltip.module.css'

export interface TooltipContentProps {
  word: string
  translation: string
  phonetic?: string
  partOfSpeech?: string
}

export function TooltipContent({ word, translation, phonetic, partOfSpeech }: TooltipContentProps) {
  return (
    <div className={styles.content} data-testid='tooltip-content'>
      <div className={styles.header}>
        <span className={styles.headword} lang='en' data-testid='tooltip-headword'>
          {word}
        </span>
      </div>
      {(phonetic || partOfSpeech) && (
        <p className={styles.meta} lang='en' data-testid='tooltip-meta'>
          {phonetic && (
            <span className={styles.phonetic} data-testid='tooltip-phonetic'>
              {phonetic}
            </span>
          )}
          {phonetic && partOfSpeech && <span aria-hidden='true'> · </span>}
          {partOfSpeech && (
            <span className={styles.pos} data-testid='tooltip-pos'>
              {partOfSpeech}
            </span>
          )}
        </p>
      )}
      <p className={styles.translation} lang='vi' aria-live='polite' data-testid='tooltip-translation'>
        {translation}
      </p>
    </div>
  )
}

