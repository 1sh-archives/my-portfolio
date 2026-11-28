'use client'

import { useEffect, useRef } from 'react'
import type { SideQuest } from '@/data/portfolio'

interface SideQuestCardProps {
  quest: SideQuest
  isHidden?: boolean
  onSelect: (quest: SideQuest, rect: DOMRect, triggerEl: HTMLButtonElement) => void
}

const TILT_MAX = 12
const HOVER_SCALE = 1.03
const PERSPECTIVE = 1100
const TILT_STIFFNESS = 240
const TILT_DAMPING = 24
const TILT_MASS = 0.6
const LIFT_STIFFNESS = 320
const LIFT_DAMPING = 26

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export default function SideQuestCard({
  quest,
  isHidden = false,
  onSelect,
}: SideQuestCardProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const rotorRef = useRef<HTMLDivElement | null>(null)
  const shadowRef = useRef<HTMLSpanElement | null>(null)
  const glareRef = useRef<HTMLSpanElement | null>(null)

  const stateRef = useRef({
    tiltX: 0,
    tiltY: 0,
    velX: 0,
    velY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    lift: 1,
    velLift: 0,
    targetLift: 1,
    sheen: 0,
    velSheen: 0,
    targetSheen: 0,
    gx: 50,
    gy: 50,
    raf: 0,
    lastTime: 0,
    reducedMotion: false,
  })

  useEffect(() => {
    const s = stateRef.current
    s.reducedMotion =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)

    return () => {
      if (s.raf) {
        cancelAnimationFrame(s.raf)
        s.raf = 0
      }
    }
  }, [])

  const applyFrame = () => {
    const s = stateRef.current
    const rotor = rotorRef.current
    const shadow = shadowRef.current
    const glare = glareRef.current

    if (rotor) {
      if (s.reducedMotion) {
        rotor.style.transform = ''
      } else {
        rotor.style.transform = `perspective(${PERSPECTIVE}px) scale(${s.lift.toFixed(4)}) rotateX(${s.tiltX.toFixed(3)}deg) rotateY(${s.tiltY.toFixed(3)}deg)`
      }
    }

    if (glare) {
      glare.style.setProperty('--fc-gx', `${s.gx.toFixed(2)}%`)
      glare.style.setProperty('--fc-gy', `${s.gy.toFixed(2)}%`)
      glare.style.setProperty('--fc-sheen', s.reducedMotion ? '0' : s.sheen.toFixed(3))
    }

    if (shadow) {
      const tiltFactor = Math.min(1, Math.hypot(s.tiltX, s.tiltY) / TILT_MAX)
      const scaleX = 1 - 0.04 * tiltFactor
      const opacity = 0.72 + 0.28 * (s.lift - 1) / (HOVER_SCALE - 1 || 1)
      shadow.style.transform = `scaleX(${scaleX.toFixed(4)})`
      shadow.style.opacity = clamp(opacity, 0.65, 1).toFixed(3)
    }
  }

  const startLoop = () => {
    const s = stateRef.current
    if (s.raf || s.reducedMotion) return
    s.lastTime = performance.now()

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - s.lastTime) / 1000))
      s.lastTime = now

      const stepSpring = (
        value: number,
        vel: number,
        target: number,
        stiffness: number,
        damping: number,
        mass = 1,
      ): [number, number] => {
        const force = -stiffness * (value - target) - damping * vel
        const nextVel = vel + (force / mass) * dt
        const nextVal = value + nextVel * dt
        return [nextVal, nextVel]
      }

      ;[s.tiltX, s.velX] = stepSpring(
        s.tiltX,
        s.velX,
        s.targetTiltX,
        TILT_STIFFNESS,
        TILT_DAMPING,
        TILT_MASS,
      )
      ;[s.tiltY, s.velY] = stepSpring(
        s.tiltY,
        s.velY,
        s.targetTiltY,
        TILT_STIFFNESS,
        TILT_DAMPING,
        TILT_MASS,
      )
      ;[s.lift, s.velLift] = stepSpring(
        s.lift,
        s.velLift,
        s.targetLift,
        LIFT_STIFFNESS,
        LIFT_DAMPING,
      )
      ;[s.sheen, s.velSheen] = stepSpring(
        s.sheen,
        s.velSheen,
        s.targetSheen,
        LIFT_STIFFNESS,
        LIFT_DAMPING,
      )

      const settled =
        Math.abs(s.tiltX - s.targetTiltX) < 0.01 &&
        Math.abs(s.tiltY - s.targetTiltY) < 0.01 &&
        Math.abs(s.velX) < 0.05 &&
        Math.abs(s.velY) < 0.05 &&
        Math.abs(s.lift - s.targetLift) < 0.001 &&
        Math.abs(s.velLift) < 0.005 &&
        Math.abs(s.sheen - s.targetSheen) < 0.005 &&
        Math.abs(s.velSheen) < 0.01

      if (settled) {
        s.tiltX = s.targetTiltX
        s.tiltY = s.targetTiltY
        s.velX = 0
        s.velY = 0
        s.lift = s.targetLift
        s.velLift = 0
        s.sheen = s.targetSheen
        s.velSheen = 0
        s.raf = 0
        applyFrame()
        return
      }

      applyFrame()
      s.raf = requestAnimationFrame(step)
    }

    s.raf = requestAnimationFrame(step)
  }

  const resetTilt = () => {
    const s = stateRef.current
    s.targetTiltX = 0
    s.targetTiltY = 0
    s.targetLift = 1
    s.targetSheen = 0
    startLoop()
  }

  const handlePointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch' || stateRef.current.reducedMotion) return
    stateRef.current.targetLift = HOVER_SCALE
    startLoop()
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const s = stateRef.current
    if (s.reducedMotion || event.pointerType === 'touch') return

    const rect = event.currentTarget.getBoundingClientRect()
    const px = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const py = clamp((event.clientY - rect.top) / rect.height, 0, 1)

    s.targetTiltX = (0.5 - py) * 2 * TILT_MAX
    s.targetTiltY = (px - 0.5) * 2 * TILT_MAX
    s.targetLift = HOVER_SCALE
    s.gx = px * 100
    s.gy = py * 100
    s.targetSheen = 1
    startLoop()
  }

  const handlePointerLeave = () => {
    resetTilt()
  }

  const handleClick = () => {
    const el = buttonRef.current
    if (!el) return
    resetTilt()
    onSelect(quest, el.getBoundingClientRect(), el)
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      data-side-quest-card
      data-side-quest-id={quest.id}
      data-cursor-label={quest.hoverTitle ?? quest.title}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      aria-label={`Open ${quest.title} pop-up`}
      className={`group/btn flip-card cursor-pointer focus-visible:outline-none ${
        isHidden ? 'pointer-events-none opacity-0' : ''
      }`}
    >
      <span ref={shadowRef} className="flip-card__shadow" aria-hidden="true" />
      <div ref={rotorRef} className="flip-card__rotor">
        <div className="flip-card__face flex items-center justify-center border border-white/10 bg-[#181818] transition-colors duration-300 group-hover/btn:border-[#8FADFF]/50 group-focus-visible/btn:border-[#8FADFF]">
          {quest.image ? (
            <img
              src={quest.image}
              alt={quest.alt}
              draggable={false}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xs tracking-[0.2em] text-[#555555]">
              {quest.placeholderLabel}
            </span>
          )}
          <span ref={glareRef} className="flip-card__glare" aria-hidden="true" />
        </div>
      </div>
    </button>
  )
}
