'use client'

import { useEffect, useRef, useState } from 'react'

type ScrambleLinkProps = {
  href: string
  label: string
  className?: string
  onClick?: () => void
}

const scrambleCharacters = '@#$*^'
const animationFrames = 12

export function ScrambleLink({ href, label, className, onClick }: ScrambleLinkProps) {
  const [displayText, setDisplayText] = useState(label)
  const [isScrambling, setIsScrambling] = useState(false)
  const [characterSlots, setCharacterSlots] = useState<Array<{ left: number; width: number; symbolWidths: Record<string, number> }>>([])
  const textRef = useRef<HTMLSpanElement>(null)
  const intervalRef = useRef<number | null>(null)

  const stopScramble = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setDisplayText(label)
    setIsScrambling(false)
  }

  const startScramble = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (intervalRef.current !== null) window.clearInterval(intervalRef.current)

    setIsScrambling(true)
    let frame = 0
    intervalRef.current = window.setInterval(() => {
      frame += 1
      const stableCharacters = Math.floor((frame / animationFrames) * label.length)
      const scrambledText = Array.from(label, (character, index) => {
        if (index < stableCharacters || character === ' ') return character
        return scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)]
      }).join('')

      setDisplayText(scrambledText)

      if (frame >= animationFrames) {
        stopScramble()
      }
    }, 28)
  }

  useEffect(() => {
    const textElement = textRef.current
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!textElement || !context) return

    context.font = getComputedStyle(textElement).font
    const characters = Array.from(label)
    const prefixWidths = characters.map((_, index) => (
      context.measureText(characters.slice(0, index).join('')).width
    ))
    const textWidth = context.measureText(label).width
    const symbolWidths = Object.fromEntries(
      Array.from(scrambleCharacters, (symbol) => [symbol, context.measureText(symbol).width]),
    )

    setCharacterSlots(characters.map((character, index) => {
      const left = prefixWidths[index]
      const nextLeft = prefixWidths[index + 1] ?? textWidth
      return { left, width: nextLeft - left, symbolWidths: character === ' ' ? {} : symbolWidths }
    }))
  }, [label])

  useEffect(() => () => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
  }, [])

  return (
    <a
      href={href}
      aria-label={label}
      className={['scramble-link', className].filter(Boolean).join(' ')}
      onClick={onClick}
      onMouseEnter={startScramble}
      onMouseLeave={stopScramble}
      onFocus={startScramble}
      onBlur={stopScramble}
    >
      <span className="scramble-link-text" aria-hidden="true">
        <span ref={textRef} className="scramble-link-label" style={{ visibility: isScrambling ? 'hidden' : 'visible' }}>
          {label}
        </span>
        {isScrambling && (
          <span className="scramble-link-animation">
            {Array.from(displayText, (character, index) => {
              const slot = characterSlots[index]
              const sourceCharacter = Array.from(label)[index]
              const symbolWidth = sourceCharacter !== character ? slot?.symbolWidths[character] : undefined

              return (
                <span
                  className="scramble-character"
                  key={index}
                  style={{
                    left: `calc(0.35rem + ${slot?.left ?? 0}px)`,
                    transform: symbolWidth && slot ? `scaleX(${slot.width / symbolWidth})` : undefined,
                  }}
                >
                  {character}
                </span>
              )
            })}
          </span>
        )}
      </span>
    </a>
  )
}
