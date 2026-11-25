'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { SideQuest } from '@/data/portfolio'

interface SideQuestModalProps {
  quest: SideQuest | null
  onClose: () => void
}

export default function SideQuestModal({ quest, onClose }: SideQuestModalProps) {
  useEffect(() => {
    if (!quest) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [quest, onClose])

  if (!quest) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="side-quest-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="max-h-[88vh] w-[70vw] max-w-5xl overflow-y-auto border border-white/15 bg-[#0c0c0c] text-[#e9e9e9] shadow-2xl"
      >
        {/* Sticky modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0c0c0c]/95 px-6 py-5 backdrop-blur-sm sm:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00a8ff]">
              Side Quest {quest.number} · {quest.tag}
            </p>
            <h3
              id="side-quest-modal-title"
              className="mt-1 font-display text-2xl tracking-[-0.05em] text-[#f4f4f4] sm:text-3xl"
            >
              {quest.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close pop-up"
            className="flex size-10 shrink-0 items-center justify-center border border-white/15 bg-[#141414] text-[#b5b5b5] transition-colors hover:border-[#00a8ff]/60 hover:text-white focus-visible:border-[#00a8ff] focus-visible:outline-none"
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
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#777777]">
                Overview
              </h4>
              <p className="mt-3 text-base leading-relaxed text-[#b5b5b5]">
                {quest.summary}
              </p>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#777777]">
                Exploration Notes
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#999999]">
                {quest.notes.map((note, index) => (
                  <li key={index} className="flex gap-2.5">
                    <span className="text-[#00a8ff]">—</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Process & gallery items */}
          <div className="space-y-6 border-t border-white/10 pt-7">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#777777]">
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
      </div>
    </div>
  )
}