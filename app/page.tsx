'use client'

import Link from 'next/link'
import TechText from '@/components/TechText'
import SideQuestCard from '@/components/SideQuestCard'
import SideQuestModal from '@/components/SideQuestModal'
import AboutPet from '@/components/AboutPet'
import LandingPreloader from '@/components/LandingPreloader'
import { projects, sideQuests, type SideQuest } from '@/data/portfolio'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

interface ActiveSideQuest {
  quest: SideQuest
  originRect: DOMRect
  triggerEl: HTMLButtonElement
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const [activeProject, setActiveProject] = useState(0)
  const [selectedSideQuest, setSelectedSideQuest] = useState<ActiveSideQuest | null>(null)
  const [preloaderRevealing, setPreloaderRevealing] = useState(false)
  const projectRefs = useRef<(HTMLElement | null)[]>([])
  const handlePreloaderExitStart = useCallback(() => setPreloaderRevealing(true), [])

  useEffect(() => {
    const updateNavState = () => setNavScrolled(window.scrollY > 72)

    updateNavState()
    window.addEventListener('scroll', updateNavState, { passive: true })

    return () => window.removeEventListener('scroll', updateNavState)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleProject = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleProject) {
          const index = Number(visibleProject.target.getAttribute('data-project-index'))
          setActiveProject(index)
        }
      },
      { threshold: [0.35, 0.65], rootMargin: '-15% 0px -25% 0px' },
    )

    projectRefs.current.forEach((projectRef) => projectRef && observer.observe(projectRef))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0

      document.documentElement.style.setProperty('--scroll-progress', `${progress}%`)
    }

    updateScrollProgress()
    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    window.addEventListener('resize', updateScrollProgress)

    return () => {
      window.removeEventListener('scroll', updateScrollProgress)
      window.removeEventListener('resize', updateScrollProgress)
    }
  }, [])

  return (
    <>
      <LandingPreloader onExitStart={handlePreloaderExitStart} />
      <main className="min-h-screen bg-[#070707] text-[#e9e9e9]">
        <header className="sticky top-0 z-40 mx-auto flex max-w-[1440px] items-center px-6 py-6 sm:px-10 lg:px-16">
          <nav
            className={`nav-shell hidden w-full items-center justify-between text-sm text-[#a2a2a2] md:flex ${navScrolled ? 'nav-shell-scrolled' : ''}`}
            aria-label="Main navigation"
          >
            <a className={`${preloaderRevealing ? 'landing-preloader-reveal' : ''} px-[0.35rem] py-[0.2rem] transition-colors hover:text-[#8FADFF]`} href="#work">Work</a>
            <a className={`${preloaderRevealing ? 'landing-preloader-reveal' : ''} px-[0.35rem] py-[0.2rem] transition-colors hover:text-[#8FADFF]`} href="#about">About</a>
            <a className={`${preloaderRevealing ? 'landing-preloader-reveal' : ''} px-[0.35rem] py-[0.2rem] transition-colors hover:text-[#8FADFF]`} href="#contact">Contact</a>
          </nav>

          <button
            className={`${preloaderRevealing ? 'landing-preloader-reveal' : ''} relative z-20 flex size-9 items-center justify-center border border-white/20 text-[#a2a2a2] md:hidden`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X data-icon="inline-start" /> : <Menu data-icon="inline-start" />}
          </button>

          {menuOpen && (
            <nav
              className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-7 bg-[#070707] text-4xl font-medium md:hidden"
              aria-label="Mobile navigation"
            >
              <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
              <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            </nav>
          )}
        </header>

        <section id="top" className="mx-auto max-w-[1440px] px-6 pb-20 pt-16 sm:px-10 sm:pt-24 lg:px-16 lg:pb-48 lg:pt-32">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className={`${preloaderRevealing ? 'landing-preloader-reveal' : ''} max-w-2xl lg:ml-[10%]`}>
              <p className="hero-greeting mb-7 text-[48px] text-[#b5b5b5]">Hi, Vansh here!</p>

              <h1 className="mt-7 max-w-xl font-display text-[48px] font-medium leading-[0.9] tracking-[-0.07em]">
                Interaction &amp; Digital Experience
              </h1>

              <div className="mt-1 h-[106px] w-full max-w-[640px]">
                <TechText
                  text="Designer."
                  fontFamily="'Arial Narrow', 'Helvetica Neue', Arial, sans-serif"
                  fontWeight={500}
                  fontSize={96}
                  letterSpacing={-0.07}
                  align="left"
                  color="#8FADFF"
                  accentColor="#8FADFF"
                  reveal="letter"
                  dashLength={4}
                  dashGap={2}
                  specks={15}
                  intro="none"
                  clickKick
                  guides={false}
                />
              </div>

              <p className="hero-description mt-4 max-w-lg text-lg leading-snug text-[#b5b5b5]">
                Finding elegance in complexity, and clarity in every interaction.
              </p>

              <p className="mt-10 font-mono text-xs uppercase tracking-[0.14em] text-[#6f6f6f]">
                Ahmedabad, India · Available for REMOTE work
              </p>
            </div>

            <div className={`${preloaderRevealing ? 'landing-preloader-reveal' : ''} flex justify-center lg:justify-end`}>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1sh%20%E2%80%93%20merged%20vector-WWjdXu0ZxUwdu5PZDofBljvf9UGPK7.png"
                alt="Dark, stylized 1sh monogram"
                className="aspect-[1500/1690] w-full max-w-[360px] object-contain lg:max-w-[420px]"
              />
            </div>
          </div>
        </section>

        <section id="work" aria-labelledby="work-heading" className="scroll-mt-24 border border-white/15 bg-[#0b0b0b]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_minmax(0,3fr)]">
            <aside className="border-b border-white/15 bg-[#0b0b0b] sm:px-0 lg:border-b-0 lg:border-r">
              <div className="px-6 py-12 sm:px-10 lg:sticky lg:top-28 lg:h-fit lg:px-8 lg:py-16">
                <h2
                  id="work-heading"
                  className="whitespace-nowrap font-display text-[clamp(2.25rem,3.4vw,2.7rem)] tracking-[-0.07em] text-[#d6d6d6]"
                >
                  My Best Works
                </h2>

                <ol className="mt-7 flex flex-col gap-3">
                  {projects.map((item, index) => (
                    <li key={item.number}>
                      <button
                        type="button"
                        aria-current={index === activeProject ? 'true' : undefined}
                        onClick={() =>
                          projectRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }
                        className="group flex w-full items-center gap-5 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                      >
                        <span
                          aria-hidden="true"
                          className={`flex size-14 shrink-0 items-center justify-center rounded-full border text-sm transition-colors ${
                            index === activeProject
                              ? 'border-white/75 text-white'
                              : 'border-white/45 text-[#b5b5b5] group-hover:border-white/75 group-hover:text-white'
                          }`}
                        >
                          {item.number}
                        </span>

                        <span
                          className={`text-[17px] tracking-[-0.035em] transition-colors ${
                            index === activeProject ? 'text-[#f4f4f4]' : 'text-[#b5b5b5] group-hover:text-white'
                          }`}
                        >
                          {item.title}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            <div className="work-projects-grid flex flex-col gap-4 px-4 py-8 sm:gap-4 sm:px-6 sm:py-10 lg:gap-4 lg:px-12 lg:py-14">
              {projects.map((item, index) => (
                <article
                  key={item.number}
                  ref={(element) => {
                    projectRefs.current[index] = element
                  }}
                  data-project-index={index}
                >
                  <Link
                    href={`/work/${item.slug}`}
                    aria-label={`Open ${item.title} project`}
                    className="project-tile-link block focus-visible:outline-none"
                  >
                    <div className="project-card relative aspect-[2.65/1] overflow-hidden">
                      <img src={item.image} alt="" className="size-full object-contain opacity-100" />
                    </div>
                  </Link>
                  <div className="pt-4" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="side-quests" className="border-y border-white/10 bg-[#101010]">
          <div className="mx-auto max-w-[1440px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
            <div className="mb-14 text-center">
              <h2 className="font-display text-5xl tracking-[-0.07em] text-[#d6d6d6] sm:text-6xl">
                Side Quests
              </h2>

              <p className="mt-4 text-sm text-[#777777]">
                Experiments, explorations and things I create just for fun.
              </p>
            </div>

            <div className="mx-auto grid w-full max-w-[960px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sideQuests.map((quest) => (
                <article key={quest.id} className="group">
                  <SideQuestCard
                    quest={quest}
                    isHidden={selectedSideQuest?.quest.id === quest.id}
                    onSelect={(selected, originRect, triggerEl) =>
                      setSelectedSideQuest({ quest: selected, originRect, triggerEl })
                    }
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="soras-playground" className="border-b border-white/10 bg-[#070707]">
          <div className="mx-auto max-w-[1440px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
            <div className="mb-14 text-center">
              <h2 className="font-display text-5xl tracking-[-0.07em] text-[#d6d6d6] sm:text-6xl">
                Sora&apos;s Playground
              </h2>
            </div>

            <div className="flex justify-center">
              <AboutPet />
            </div>
          </div>
        </section>

        <section id="about" className="border-b border-white/10 bg-[#101010]">
          <div className="mx-auto max-w-[1440px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
            <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#8FADFF]">
                  A little about me
                </span>

                <h2 className="mt-5 font-display text-5xl tracking-[-0.07em] text-[#d6d6d6] sm:text-6xl">
                  About Me.
                </h2>

                <p className="mt-8 max-w-xl text-base leading-[1.9] text-[#999999]">
                  Hey! I&apos;m Vansh, an interaction and digital experience designer
                  passionate about creating meaningful digital experiences.
                </p>

                <p className="mt-5 max-w-xl text-base leading-[1.9] text-[#999999]">
                  I enjoy exploring the intersection of design, technology and
                  creativity.
                </p>

                <p className="mt-5 max-w-xl text-base leading-[1.9] text-[#999999]">
                  Outside of design, I&apos;m always seeking new experiences, experimenting with new
                  ideas and finding inspiration in the world around me.
                </p>

              </div>

              <div className="flex w-full justify-center">
                <div className="inline-flex max-w-full border border-white/10 bg-[#181818] transition-colors duration-300 hover:border-[#8FADFF]/40">
                  <img
                    src="/me.jpg"
                    alt="Portrait of Vansh"
                    className="block h-auto w-auto max-w-[420px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer id="contact" className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
          <div className="border-b border-white/10 pb-16 text-center sm:pb-20">
            <h2 className="font-display text-5xl tracking-[-0.07em] text-[#d6d6d6] sm:text-7xl">
              Contact
            </h2>

            <div className="mt-8 flex flex-col items-center justify-center gap-5 text-sm text-[#8c8c8c] sm:flex-row sm:gap-10">
              <a
                href="mailto:vanshsingh.design@gmail.com"
                className="group flex items-center gap-2 transition-colors hover:text-[#8FADFF]"
              >
                Email{' '}
                <ArrowUpRight
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  aria-hidden="true"
                />
              </a>

              <a
                href="https://linkedin.com/in/vanshsingh74"
                className="group flex items-center gap-2 transition-colors hover:text-[#8FADFF]"
              >
                LinkedIn{' '}
                <ArrowUpRight
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  aria-hidden="true"
                />
              </a>

              <a
                href="https://instagram.com/1sh.archives?xtok=MXJmNDliZ2JndW90Mw=="
                className="group flex items-center gap-2 transition-colors hover:text-[#8FADFF]"
              >
                Instagram{' '}
                <ArrowUpRight
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-6 text-xs text-[#6f6f6f] sm:flex-row sm:justify-between">
            <p>© 2026 Vansh</p>
            <a href="#top" className="transition-colors hover:text-[#8FADFF]">
              Back to top ↑
            </a>
          </div>
        </footer>
      </main>

      <SideQuestModal
        quest={selectedSideQuest?.quest ?? null}
        originRect={selectedSideQuest?.originRect ?? null}
        triggerEl={selectedSideQuest?.triggerEl ?? null}
        onClose={() => {
          const trigger = selectedSideQuest?.triggerEl
          setSelectedSideQuest(null)
          trigger?.focus({ preventScroll: true })
        }}
      />
    </>
  )
}