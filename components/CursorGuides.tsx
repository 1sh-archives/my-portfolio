'use client'

import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { sideQuests, type SideQuest } from '@/data/portfolio'

interface CursorGuidesProps {
  modalOpen: boolean
}

export default function CursorGuides({ modalOpen }: CursorGuidesProps) {
  const [hoveredSideQuest, setHoveredSideQuest] = useState<SideQuest | null>(null)
  const cursorGuidesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const interactiveSelector =
      'a[href]:not([href^="#"]), [role="link"]:not([aria-disabled="true"]):not([href^="#"])'
    let isOverSideQuest = false

    const updateCursorGuides = (event: PointerEvent) => {
      const guides = cursorGuidesRef.current
      if (!guides || event.pointerType === 'touch') return

      const element = event.target instanceof Element ? event.target : null
      const target = element?.closest(interactiveSelector)
      const sideQuestTarget = element?.closest<HTMLElement>('[data-side-quest-card]')

      const boxWidth = 248
      const boxHeight = 92
      const gap = 16
      const clampedX = Math.min(
        Math.max(event.clientX + gap, gap),
        window.innerWidth - boxWidth - gap,
      )
      const clampedY = Math.min(
        Math.max(event.clientY - gap, boxHeight + gap),
        window.innerHeight - gap,
      )

      guides.style.setProperty('--cursor-x', `${event.clientX}px`)
      guides.style.setProperty('--cursor-y', `${event.clientY}px`)
      guides.style.setProperty('--quest-box-x', `${clampedX}px`)
      guides.style.setProperty('--quest-box-y', `${clampedY}px`)

      if (sideQuestTarget) {
        const questId = sideQuestTarget.getAttribute('data-side-quest-id')
        const matchedQuest = sideQuests.find((q) => q.id === questId) ?? null
        setHoveredSideQuest(matchedQuest)
      } else {
        setHoveredSideQuest(null)
      }

      const axisX = guides.querySelector<HTMLElement>('.cursor-guide-x')
      const axisY = guides.querySelector<HTMLElement>('.cursor-guide-y')

      if (axisX) {
        axisX.style.cssText +=
          'display: block !important; opacity: 1 !important; visibility: visible !important;'
      }

      if (axisY) {
        axisY.style.cssText +=
          'display: block !important; opacity: 1 !important; visibility: visible !important;'
      }

      guides.classList.toggle('cursor-guides-interactive', Boolean(target))

      const nextIsOverSideQuest = Boolean(sideQuestTarget)

      if (nextIsOverSideQuest !== isOverSideQuest) {
        isOverSideQuest = nextIsOverSideQuest

        guides.classList.toggle('cursor-guides-side-quest', isOverSideQuest)
        guides.querySelector('.cursor-guide-plus')?.classList.toggle('!opacity-0', isOverSideQuest)
        guides.querySelector('.cursor-guide-icon')?.classList.toggle('!opacity-0', isOverSideQuest)
        guides.querySelector('.cursor-guide-zoom')?.classList.toggle('!opacity-100', isOverSideQuest)
      }

      guides.classList.add('cursor-guides-visible')
      document.documentElement.classList.add('custom-cursor-ready')
    }

    const hideCursorGuides = (event: PointerEvent) => {
      if (event.relatedTarget !== null) return

      const guides = cursorGuidesRef.current

      guides?.classList.remove(
        'cursor-guides-visible',
        'cursor-guides-interactive',
        'cursor-guides-side-quest',
      )
      guides?.querySelector('.cursor-guide-plus')?.classList.remove('!opacity-0')
      guides?.querySelector('.cursor-guide-icon')?.classList.remove('!opacity-0')
      guides?.querySelector('.cursor-guide-zoom')?.classList.remove('!opacity-100')

      setHoveredSideQuest(null)
      isOverSideQuest = false
      document.documentElement.classList.remove('custom-cursor-ready')
    }

    window.addEventListener('pointermove', updateCursorGuides, { passive: true })
    window.addEventListener('pointerout', hideCursorGuides)

    return () => {
      window.removeEventListener('pointermove', updateCursorGuides)
      window.removeEventListener('pointerout', hideCursorGuides)
      document.documentElement.classList.remove('custom-cursor-ready')
    }
  }, [])

  useEffect(() => {
    if (!modalOpen) return

    setHoveredSideQuest(null)
    const guides = cursorGuidesRef.current
    guides?.classList.remove('cursor-guides-side-quest')
    guides?.querySelector('.cursor-guide-plus')?.classList.remove('!opacity-0')
    guides?.querySelector('.cursor-guide-icon')?.classList.remove('!opacity-0')
    guides?.querySelector('.cursor-guide-zoom')?.classList.remove('!opacity-100')
    guides?.classList.add('cursor-guides-visible')
    document.documentElement.classList.add('custom-cursor-ready')
  }, [modalOpen])

  return (
    <div
      ref={cursorGuidesRef}
      className="cursor-guides pointer-events-none fixed inset-0 z-[99999]"
      style={{ zIndex: 99999 }}
      aria-hidden="true"
    >
      <span
        className="cursor-guide cursor-guide-x pointer-events-none"
        style={{ display: 'block', opacity: 1, visibility: 'visible' }}
      />
      <span
        className="cursor-guide cursor-guide-y pointer-events-none"
        style={{ display: 'block', opacity: 1, visibility: 'visible' }}
      />
      <span className="cursor-guide-plus pointer-events-none" />
      <img
        src="/cursor.svg"
        alt=""
        className="cursor-guide-icon pointer-events-none"
      />

      {hoveredSideQuest && (
        <div
          className="pointer-events-none fixed w-[248px] -translate-y-full"
          style={{
            left: 'var(--quest-box-x)',
            top: 'var(--quest-box-y)',
            zIndex: 100001,
          }}
        >
          {/* Outer L brackets sitting right outside each corner */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-[5px] -top-[5px] h-[7px] w-[7px] border-l border-t border-white"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-[5px] -top-[5px] h-[7px] w-[7px] border-r border-t border-white"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[5px] -left-[5px] h-[7px] w-[7px] border-b border-l border-white"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[5px] -right-[5px] h-[7px] w-[7px] border-b border-r border-white"
          />

          {/* Main white-stroked box */}
          <div className="border border-white/85 bg-[#0c0c0c]/95 px-3 py-2.5 text-left text-[#f4f4f4] shadow-lg backdrop-blur-xs">
            <p className="font-mono text-[11px] font-medium leading-tight tracking-[-0.02em] text-white">
              {hoveredSideQuest.hoverTitle ?? hoveredSideQuest.title}
            </p>
            <p className="mt-1 text-[11px] leading-[1.4] text-[#b5b5b5]">
              {hoveredSideQuest.hoverDetail ?? hoveredSideQuest.summary}
            </p>
          </div>
        </div>
      )}

      <div
        className="cursor-guide-zoom pointer-events-none fixed flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-[#070707]/80 text-white opacity-0"
        style={{ left: 'var(--cursor-x)', top: 'var(--cursor-y)', zIndex: 100000 }}
        aria-hidden="true"
      >
        <Search size={12} strokeWidth={1.7} />
      </div>
    </div>
  )
}