'use client'

import { useEffect, useState } from 'react'
import styles from './LandingPreloader.module.css'

const DISPLAY_DURATION = 3000
const EXIT_DURATION = 700
const PRELOAD_FRAMES = [
  '/preloader/frame-1.png',
  '/preloader/frame-2.png',
  '/preloader/frame-3.png',
  '/preloader/frame-4.png',
  '/preloader/frame-5.png',
  '/preloader/frame-6.png',
  '/preloader/frame-7.png',
  '/preloader/frame-8.png',
]

export default function LandingPreloader({ onExitStart }: { onExitStart: () => void }) {
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(false)
      return
    }

    const exitTimer = window.setTimeout(() => {
      setExiting(true)
      onExitStart()
    }, DISPLAY_DURATION)
    const removeTimer = window.setTimeout(
      () => setVisible(false),
      DISPLAY_DURATION + EXIT_DURATION,
    )

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(removeTimer)
    }
  }, [onExitStart])

  if (!visible) return null

  return (
    <div
      className={`${styles.screen} ${exiting ? styles.exiting : ''}`}
      role="status"
      aria-label="Loading portfolio"
    >
      <div className={styles.imageStage} aria-hidden="true">
        {PRELOAD_FRAMES.map((src) => (
          <img
            key={src}
            className={styles.frame}
            src={src}
            alt=""
            loading="eager"
            decoding="async"
            draggable={false}
          />
        ))}
      </div>
    </div>
  )
}
