'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { SideQuest } from '@/data/portfolio'

interface SideQuestModalProps {
  quest: SideQuest | null
  originRect: DOMRect | null
  triggerEl: HTMLButtonElement | null
  onClose: () => void
}

type ModalPhase = 'measuring' | 'opening' | 'open' | 'closing'

interface RectBox {
  left: number
  top: number
  width: number
  height: number
}

const FLIP_STIFFNESS = 170
const FLIP_DAMPING = 20
const PERSPECTIVE = 1400

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function SideQuestDetailsBody({
  quest,
  onClose,
}: {
  quest: SideQuest
  onClose: () => void
}) {
  return (
    <>
      {/* Sticky modal header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0c0c0c]/95 px-6 py-5 backdrop-blur-sm sm:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8FADFF]">
            Side Quest {quest.number} · {quest.tag}
          </p>
          <h3
            id="side-quest-modal-title"
            className="mt-1 font-display text-2xl tracking-[-0.02em] text-[#f4f4f4] sm:text-3xl"
          >
            {quest.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close pop-up"
          className="flex size-10 shrink-0 items-center justify-center border border-white/15 bg-[#141414] text-[#b5b5b5] transition-colors hover:border-[#8FADFF]/60 hover:text-white focus-visible:border-[#8FADFF] focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Scrollable modal body */}
      <div className="space-y-8 px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex min-h-[280px] items-center justify-center overflow-hidden border border-white/10 bg-[#141414] p-4 sm:min-h-[380px]">
          {quest.image ? (
            <img
              src={quest.image}
              alt={quest.alt}
              className="max-h-[460px] w-auto max-w-full object-contain"
            />
          ) : (
            <span className="font-mono text-xs tracking-[0.22em] text-[#666666]">
              {quest.placeholderLabel}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#777777]">
              Overview
            </h4>
            <p className="mt-3 text-base leading-relaxed text-[#b5b5b5]">
              {quest.summary}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#777777]">
              Exploration Notes
            </h4>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#999999]">
              {quest.notes.map((note, index) => (
                <li key={index} className="flex gap-2.5">
                  <span className="text-[#8FADFF]">—</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Process & gallery items */}
        <div className="space-y-6 border-t border-white/10 pt-7">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#777777]">
            Process &amp; Frames
          </h4>

          {quest.gallery && quest.gallery.length > 0 ? (
            quest.gallery.map((item, idx) => (
              <div
                key={idx}
                className="space-y-3 border border-white/10 bg-[#141414] p-4"
              >
                <div className="flex items-center justify-center bg-[#0c0c0c] p-4">
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="max-h-[420px] w-auto max-w-full object-contain"
                  />
                </div>
                <p className="text-xs leading-relaxed text-[#8c8c8c]">
                  {item.caption}
                </p>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              <div className="flex h-56 items-center justify-center border border-dashed border-white/10 bg-[#141414] font-mono text-xs tracking-[0.2em] text-[#555555]">
                ADDITIONAL STUDY FRAME
              </div>
              <div className="flex h-56 items-center justify-center border border-dashed border-white/10 bg-[#141414] font-mono text-xs tracking-[0.2em] text-[#555555]">
                PROCESS / VARIATION FRAME
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function SideQuestModal({
  quest,
  originRect,
  triggerEl,
  onClose,
}: SideQuestModalProps) {
  const [phase, setPhase] = useState<ModalPhase>('measuring')
  const [targetRect, setTargetRect] = useState<RectBox | null>(null)

  const panelRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const backInnerRef = useRef<HTMLDivElement | null>(null)
  const shadowRef = useRef<HTMLSpanElement | null>(null)
  const animRef = useRef<{
    raf: number
    progress: number
    velocity: number
  }>({ raf: 0, progress: 0, velocity: 0 })
  const requestCloseRef = useRef<() => void>(() => {})

  const stopAnim = useCallback(() => {
    if (animRef.current.raf) {
      cancelAnimationFrame(animRef.current.raf)
      animRef.current.raf = 0
    }
  }, [])

  const applyAnimationFrame = useCallback(
    (progress: number, from: RectBox, to: RectBox) => {
      const stage = stageRef.current
      const backdrop = backdropRef.current
      const backInner = backInnerRef.current
      const shadow = shadowRef.current

      const left = from.left + (to.left - from.left) * progress
      const top = from.top + (to.top - from.top) * progress
      const width = Math.max(24, from.width + (to.width - from.width) * progress)
      const height = Math.max(24, from.height + (to.height - from.height) * progress)
      const deg = 180 * progress

      if (stage) {
        stage.style.left = `${left.toFixed(2)}px`
        stage.style.top = `${top.toFixed(2)}px`
        stage.style.width = `${width.toFixed(2)}px`
        stage.style.height = `${height.toFixed(2)}px`
        stage.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${deg.toFixed(3)}deg)`
      }

      if (backInner) {
        const scaleX = width / Math.max(1, to.width)
        const scaleY = height / Math.max(1, to.height)
        backInner.style.transform = `scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`
      }

      if (backdrop) {
        backdrop.style.backgroundColor = `rgba(0, 0, 0, ${(0.8 * clamp(progress, 0, 1)).toFixed(3)})`
      }

      if (shadow) {
        const facing = Math.abs(Math.cos((deg * Math.PI) / 180))
        const handoffFade = 1 - clamp((progress - 0.7) / 0.3, 0, 1)
        shadow.style.transform = `scaleX(${(0.08 + 0.92 * facing).toFixed(4)})`
        shadow.style.opacity = ((0.1 + 0.9 * facing * facing) * handoffFade).toFixed(3)
      }
    },
    [],
  )

  const runSpring = useCallback(
    (
      targetProgress: 0 | 1,
      from: RectBox,
      to: RectBox,
      onSettled: () => void,
    ) => {
      stopAnim()
      let lastTime = performance.now()

      const tick = (now: number) => {
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000))
        lastTime = now

        const anim = animRef.current
        const force =
          -FLIP_STIFFNESS * (anim.progress - targetProgress) -
          FLIP_DAMPING * anim.velocity
        anim.velocity += force * dt
        anim.progress += anim.velocity * dt

        const settled =
          Math.abs(anim.progress - targetProgress) < 0.0015 &&
          Math.abs(anim.velocity) < 0.008

        if (settled) {
          anim.progress = targetProgress
          anim.velocity = 0
          anim.raf = 0
          applyAnimationFrame(targetProgress, from, to)
          onSettled()
          return
        }

        applyAnimationFrame(anim.progress, from, to)
        anim.raf = requestAnimationFrame(tick)
      }

      applyAnimationFrame(animRef.current.progress, from, to)
      animRef.current.raf = requestAnimationFrame(tick)
    },
    [applyAnimationFrame, stopAnim],
  )

  const requestClose = useCallback(() => {
    if (!quest || phase === 'closing') return

    const reducedMotion =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)

    const currentOrigin = triggerEl?.getBoundingClientRect() ?? originRect
    const measuredPanel = panelRef.current?.getBoundingClientRect()
    const currentTarget: RectBox | null = measuredPanel
      ? {
          left: measuredPanel.left,
          top: measuredPanel.top,
          width: measuredPanel.width,
          height: measuredPanel.height,
        }
      : targetRect

    if (panelRef.current) {
      panelRef.current.scrollTop = 0
    }

    if (reducedMotion || !currentOrigin || !currentTarget) {
      stopAnim()
      onClose()
      return
    }

    setTargetRect(currentTarget)
    setPhase('closing')

    requestAnimationFrame(() => {
      runSpring(0, currentOrigin, currentTarget, () => {
        onClose()
      })
    })
  }, [onClose, originRect, phase, quest, runSpring, stopAnim, targetRect, triggerEl])

  requestCloseRef.current = requestClose

  // Cleanup any active animation frame only on unmount
  useEffect(() => stopAnim, [stopAnim])

  // Lock body scroll and listen for Escape while modal is mounted for a quest
  useEffect(() => {
    if (!quest) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestCloseRef.current()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      stopAnim()
    }
  }, [quest, stopAnim])

  // Measure target modal box and kick off flip + zoom opening spring
  useLayoutEffect(() => {
    if (!quest) {
      setPhase('measuring')
      setTargetRect(null)
      animRef.current = { raf: 0, progress: 0, velocity: 0 }
      return
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)

    const panel = panelRef.current
    if (!panel || !originRect || reducedMotion) {
      setPhase('open')
      return
    }

    const rect = panel.getBoundingClientRect()
    const measured: RectBox = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    }
    const from: RectBox = {
      left: originRect.left,
      top: originRect.top,
      width: originRect.width,
      height: originRect.height,
    }

    animRef.current = { raf: 0, progress: 0, velocity: 0 }
    setTargetRect(measured)
    setPhase('opening')

    requestAnimationFrame(() => {
      runSpring(1, from, measured, () => {
        setPhase('open')
      })
    })
  }, [quest, originRect, runSpring])

  if (!quest) return null

  const isTransitioning = (phase === 'opening' || phase === 'closing') && targetRect !== null

  return (
    <>
      {/* Hidden measurement / settled open modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-quest-modal-title"
        onClick={requestClose}
        className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 ${
          phase === 'open'
            ? 'bg-black/80'
            : 'pointer-events-none bg-transparent opacity-0'
        }`}
      >
        <div
          ref={panelRef}
          onClick={(event) => event.stopPropagation()}
          className="no-scrollbar max-h-[88vh] w-[70vw] max-w-5xl overflow-y-auto border border-white/15 bg-[#0c0c0c] text-[#e9e9e9] shadow-2xl"
        >
          <SideQuestDetailsBody quest={quest} onClose={requestClose} />
        </div>
      </div>

      {/* 3D Flip + Zoom transition layer */}
      {isTransitioning && targetRect && (
        <div
          ref={backdropRef}
          onClick={requestClose}
          className="flip-stage-backdrop"
          style={{
            backgroundColor:
              phase === 'closing' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0)',
          }}
          aria-hidden="true"
        >
          <div
            ref={stageRef}
            onClick={(event) => event.stopPropagation()}
            className="flip-stage-rotor"
            style={
              phase === 'opening' && originRect
                ? {
                    left: `${originRect.left}px`,
                    top: `${originRect.top}px`,
                    width: `${originRect.width}px`,
                    height: `${originRect.height}px`,
                    transform: `perspective(${PERSPECTIVE}px) rotateY(0deg)`,
                  }
                : {
                    left: `${targetRect.left}px`,
                    top: `${targetRect.top}px`,
                    width: `${targetRect.width}px`,
                    height: `${targetRect.height}px`,
                    transform: `perspective(${PERSPECTIVE}px) rotateY(180deg)`,
                  }
            }
          >
            <span ref={shadowRef} className="flip-card__shadow" aria-hidden="true" />

            {/* Front face: exact Side Quest card */}
            <div className="flip-card__face flex items-center justify-center border border-white/10 bg-[#181818]">
              {quest.image ? (
                <img
                  src={quest.image}
                  alt={quest.alt}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs tracking-[0.2em] text-[#555555]">
                  {quest.placeholderLabel}
                </span>
              )}
            </div>

            {/* Back face: details box zoomed proportionally without text reflow */}
            <div className="flip-card__face flip-card__face--back">
              <div
                ref={backInnerRef}
                className="overflow-hidden border border-white/15 bg-[#0c0c0c] text-[#e9e9e9] shadow-2xl"
                style={{
                  width: `${targetRect.width}px`,
                  height: `${targetRect.height}px`,
                  transformOrigin: 'top left',
                }}
              >
                <SideQuestDetailsBody quest={quest} onClose={requestClose} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
