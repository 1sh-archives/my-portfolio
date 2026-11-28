'use client'

import { useEffect, useRef, useState } from 'react'

const soraArcPath = 'M4 22 C4 10 10 4 18 4 C26 4 32 10 32 22'
const BALL_COUNT = 7
const BALL_RADIUS = 12

interface WiggleTracker {
  lastX: number
  direction: number
  turns: number
  lastTurnAt: number
}

interface BallPosition {
  x: number
  y: number
}

interface BallState {
  id: number
  position: BallPosition | null
  velocityX: number
  velocityY: number
  isFalling: boolean
}

interface BallPointerSample {
  x: number
  y: number
  time: number
}

export default function AboutPet() {
  const faceRef = useRef<HTMLButtonElement | null>(null)
  const toyBoxRef = useRef<HTMLDivElement | null>(null)
  const eyeRefs = useRef<(HTMLSpanElement | null)[]>([])
  const wiggleRef = useRef<WiggleTracker>({ lastX: 0, direction: 0, turns: 0, lastTurnAt: 0 })
  const laughTimeoutRef = useRef<number | undefined>(undefined)
  const happyTimeoutRef = useRef<number | undefined>(undefined)
  const releaseReactionTimeoutRef = useRef<number | undefined>(undefined)
  const noTimeoutRef = useRef<number | undefined>(undefined)
  const noAnimationsRef = useRef<Animation[]>([])
  const [balls, setBalls] = useState<BallState[]>(() =>
    Array.from({ length: BALL_COUNT }, (_, id) => ({
      id,
      position: null,
      velocityX: 0,
      velocityY: 0,
      isFalling: false,
    })),
  )
  const ballsRef = useRef<BallState[]>(balls)
  const ballPointerIdRef = useRef<number | null>(null)
  const activeBallIdRef = useRef<number | null>(null)
  const ballDragSamplesRef = useRef<BallPointerSample[]>([])
  const isSayingNoRef = useRef(false)
  const [isSayingNo, setIsSayingNo] = useState(false)
  const [isLaughing, setIsLaughing] = useState(false)
  const [isSurprised, setIsSurprised] = useState(false)
  const [isSadAfterBallRelease, setIsSadAfterBallRelease] = useState(false)
  const [isBallOverSora, setIsBallOverSora] = useState(false)
  const [isHappyAfterTakingBall, setIsHappyAfterTakingBall] = useState(false)
  const [isBallFalling, setIsBallFalling] = useState(false)

  const clearBallReleaseReaction = () => {
    window.clearTimeout(releaseReactionTimeoutRef.current)
    setIsSadAfterBallRelease(false)
  }

  const showBallReleaseReaction = () => {
    window.clearTimeout(releaseReactionTimeoutRef.current)
    window.clearTimeout(laughTimeoutRef.current)
    wiggleRef.current = { lastX: 0, direction: 0, turns: 0, lastTurnAt: 0 }
    setIsLaughing(false)
    setIsSadAfterBallRelease(true)
    releaseReactionTimeoutRef.current = window.setTimeout(() => {
      window.clearTimeout(laughTimeoutRef.current)
      setIsLaughing(false)
      setIsSadAfterBallRelease(false)
    }, 1000)
  }

  const isPositionOverSora = (position: BallPosition | null) => {
    const toyBox = toyBoxRef.current
    const face = faceRef.current
    if (!position || !toyBox || !face) return false

    const boxBounds = toyBox.getBoundingClientRect()
    const faceBounds = face.getBoundingClientRect()
    const centerX = boxBounds.left + position.x
    const centerY = boxBounds.top + position.y

    return (
      centerX + BALL_RADIUS > faceBounds.left &&
      centerX - BALL_RADIUS < faceBounds.right &&
      centerY + BALL_RADIUS > faceBounds.top &&
      centerY - BALL_RADIUS < faceBounds.bottom
    )
  }

  const syncBalls = (nextBalls: BallState[]) => {
    ballsRef.current = nextBalls
    setBalls(nextBalls)
    const overlapsSora = nextBalls.some((ball) => isPositionOverSora(ball.position))
    setIsBallOverSora(overlapsSora)
  }

  const updateBall = (ballId: number, updates: Partial<BallState>) => {
    syncBalls(
      ballsRef.current.map((ball) => (ball.id === ballId ? { ...ball, ...updates } : ball)),
    )
  }

  const takeBall = (ballId: number) => {
    const remainingBalls = ballsRef.current.filter((ball) => ball.id !== ballId)
    if (remainingBalls.length === ballsRef.current.length) return

    window.clearTimeout(laughTimeoutRef.current)
    window.clearTimeout(happyTimeoutRef.current)
    clearBallReleaseReaction()
    ballDragSamplesRef.current = []
    activeBallIdRef.current = null
    ballPointerIdRef.current = null
    setIsLaughing(false)
    setIsSurprised(false)
    syncBalls(remainingBalls)
    setIsBallFalling(remainingBalls.some((ball) => ball.isFalling))
    setIsHappyAfterTakingBall(true)
    wiggleRef.current = { lastX: 0, direction: 0, turns: 0, lastTurnAt: 0 }
    happyTimeoutRef.current = window.setTimeout(() => {
      window.clearTimeout(laughTimeoutRef.current)
      setIsLaughing(false)
      setIsHappyAfterTakingBall(false)
      wiggleRef.current = { lastX: 0, direction: 0, turns: 0, lastTurnAt: 0 }
    }, 1500)
  }

  const clampBallPosition = (position: BallPosition, toyBox: HTMLDivElement) => {
    const section = toyBox.closest<HTMLElement>('#soras-playground')
    if (!section) {
      console.error('Unable to find the Sora playground bounds.')
      return null
    }

    const boxBounds = toyBox.getBoundingClientRect()
    const sectionBounds = section.getBoundingClientRect()
    const minX = sectionBounds.left - boxBounds.left + BALL_RADIUS
    const maxX = sectionBounds.right - boxBounds.left - BALL_RADIUS
    const minY = sectionBounds.top - boxBounds.top + BALL_RADIUS
    const maxY = sectionBounds.bottom - boxBounds.top - BALL_RADIUS

    return {
      x: Math.max(minX, Math.min(maxX, position.x)),
      y: Math.max(minY, Math.min(maxY, position.y)),
    }
  }

  const recordBallPointerSample = (x: number, y: number) => {
    const now = performance.now()
    const samples = ballDragSamplesRef.current
    samples.push({ x, y, time: now })

    while (samples.length > 1 && now - samples[0].time > 100) {
      samples.shift()
    }
  }

  useEffect(() => {
    const toyBox = toyBoxRef.current
    if (!toyBox) return

    const { width } = toyBox.getBoundingClientRect()
    const initializedBalls = ballsRef.current.map((ball) => {
      const index = ball.id
      const rowSize = index < 4 ? 4 : 3
      const rowIndex = index < 4 ? index : index - 4
      const spacing = (width - BALL_RADIUS * 2) / rowSize
      const offset = (width - spacing * (rowSize - 1)) / 2
      return {
        ...ball,
        isFalling: true,
        position: {
          x: offset + spacing * rowIndex,
          y: index < 4 ? 48 : 18,
        },
      }
    })
    syncBalls(initializedBalls)
    setIsBallFalling(initializedBalls.some((ball) => ball.isFalling))
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let blinkTimeout: number
    let nextBlinkTimeout: number

    const scheduleBlink = () => {
      nextBlinkTimeout = window.setTimeout(() => {
        eyeRefs.current.forEach((eye) => eye?.classList.add('is-blinking'))
        blinkTimeout = window.setTimeout(() => {
          eyeRefs.current.forEach((eye) => eye?.classList.remove('is-blinking'))
          scheduleBlink()
        }, 180)
      }, 3000 + Math.random() * 2000)
    }

    const updateGaze = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return

      const face = faceRef.current
      if (!face) return

      const bounds = face.getBoundingClientRect()
      const horizontal = Math.max(
        -1,
        Math.min(1, (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)),
      )
      const vertical = Math.max(
        -1,
        Math.min(1, (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)),
      )
      const x = horizontal * 5
      const y = vertical * 5

      face.style.setProperty('--gaze-x', `${x}px`)
      face.style.setProperty('--gaze-y', `${y}px`)
    }

    window.addEventListener('pointermove', updateGaze, { passive: true })
    scheduleBlink()

    return () => {
      window.removeEventListener('pointermove', updateGaze)
      window.clearTimeout(nextBlinkTimeout)
      window.clearTimeout(blinkTimeout)
      window.clearTimeout(laughTimeoutRef.current)
      window.clearTimeout(happyTimeoutRef.current)
      window.clearTimeout(releaseReactionTimeoutRef.current)
      window.clearTimeout(noTimeoutRef.current)
      noAnimationsRef.current.forEach((animation) => animation.cancel())
      eyeRefs.current.forEach((eye) => eye?.classList.remove('is-blinking'))
    }
  }, [])

  useEffect(() => {
    if (!isBallFalling) return

    let frameId = 0
    let previousFrameTime: number | null = null
    const gravity = 1600
    const bounce = 0.3
    const boxFloorY = 60 - BALL_RADIUS

    const step = (time: number) => {
      const box = toyBoxRef.current
      const section = box?.closest<HTMLElement>('#soras-playground')

      if (!box || !section) {
        console.error('Unable to find the Sora playground floor collider.')
        setIsBallFalling(false)
        return
      }

      const activeBalls = ballsRef.current.filter(
        (ball) => ball.isFalling && ball.id !== activeBallIdRef.current,
      )
      if (activeBalls.length === 0) {
        setIsBallFalling(false)
        return
      }

      const boxBounds = box.getBoundingClientRect()
      const sectionBounds = section.getBoundingClientRect()
      const deltaTime =
        previousFrameTime === null ? 0 : Math.min((time - previousFrameTime) / 1000, 0.032)
      previousFrameTime = time
      if (deltaTime === 0) {
        frameId = window.requestAnimationFrame(step)
        return
      }

      const nextBalls = ballsRef.current.map((ball) => {
        if (!ball.isFalling || ball.id === activeBallIdRef.current) return ball
        if (!ball.position) return { ...ball, isFalling: false }

        const currentPosition = ball.position
        let velocityX = ball.velocityX
        let velocityY = ball.velocityY + gravity * deltaTime
        let x = currentPosition.x + velocityX * deltaTime
        let y = currentPosition.y + velocityY * deltaTime
        const pageMinX = sectionBounds.left - boxBounds.left + BALL_RADIUS
        const pageMaxX = sectionBounds.right - boxBounds.left - BALL_RADIUS
        if (x < pageMinX) {
          x = pageMinX
          velocityX = Math.abs(velocityX) * bounce
        } else if (x > pageMaxX) {
          x = pageMaxX
          velocityX = -Math.abs(velocityX) * bounce
        }

        const pageMinY = sectionBounds.top - boxBounds.top + BALL_RADIUS
        if (y < pageMinY) {
          y = pageMinY
          velocityY = Math.abs(velocityY) * bounce
        }

        const boxMinX = (boxBounds.width * 6) / 256 + BALL_RADIUS
        const boxMaxX = (boxBounds.width * 250) / 256 - BALL_RADIUS
        const boxWallsOverlapBall =
          currentPosition.y >= 4 + BALL_RADIUS && currentPosition.y <= boxFloorY

        if (boxWallsOverlapBall) {
          if (currentPosition.x >= boxMinX && x < boxMinX) {
            x = boxMinX
            velocityX = Math.abs(velocityX) * bounce
          } else if (currentPosition.x <= boxMinX && x > boxMinX) {
            x = boxMinX
            velocityX = -Math.abs(velocityX) * bounce
          } else if (currentPosition.x <= boxMaxX && x > boxMaxX) {
            x = boxMaxX
            velocityX = -Math.abs(velocityX) * bounce
          } else if (currentPosition.x >= boxMaxX && x < boxMaxX) {
            x = boxMaxX
            velocityX = Math.abs(velocityX) * bounce
          }
        }

        const ballInsideBox = x >= boxMinX && x <= boxMaxX
        const pageFloorY = sectionBounds.bottom - boxBounds.top - BALL_RADIUS
        const floorY =
          ballInsideBox && currentPosition.y <= boxFloorY
            ? Math.min(boxFloorY, pageFloorY)
            : pageFloorY

        if (y >= floorY && velocityY > 0) {
          y = floorY
          velocityY = -velocityY * bounce
          if (Math.abs(velocityY) < 35) velocityY = 0
          if (velocityY === 0) velocityX *= Math.exp(-4 * deltaTime)
        }

        velocityX *= Math.exp(-0.08 * deltaTime)
        if (Math.abs(velocityX) < 8) velocityX = 0
        const isFalling = velocityX !== 0 || velocityY !== 0

        return {
          ...ball,
          position: { x, y },
          velocityX,
          velocityY,
          isFalling,
        }
      })

      syncBalls(nextBalls)

      if (!nextBalls.some((ball) => ball.isFalling && ball.id !== activeBallIdRef.current)) {
        setIsBallFalling(false)
        return
      }
      frameId = window.requestAnimationFrame(step)
    }

    frameId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frameId)
  }, [isBallFalling])

  const startWiggleTracking = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse') return
    wiggleRef.current = { lastX: event.clientX, direction: 0, turns: 0, lastTurnAt: 0 }
  }

  const trackWiggle = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse' || event.buttons !== 0 || ballPointerIdRef.current !== null) {
      return
    }

    if (isSadAfterBallRelease) {
      wiggleRef.current = { lastX: event.clientX, direction: 0, turns: 0, lastTurnAt: 0 }
      return
    }

    if (isHappyAfterTakingBall) {
      wiggleRef.current = { lastX: event.clientX, direction: 0, turns: 0, lastTurnAt: 0 }
      return
    }

    if (isSayingNo || isSurprised) return

    const tracker = wiggleRef.current
    const delta = event.clientX - tracker.lastX
    if (Math.abs(delta) < 8) return

    const direction = Math.sign(delta)
    const now = performance.now()
    tracker.lastX = event.clientX

    if (tracker.lastTurnAt && now - tracker.lastTurnAt > 700) {
      tracker.turns = 0
    }

    if (tracker.direction && tracker.direction !== direction) {
      tracker.turns += 1
      tracker.lastTurnAt = now

      if (tracker.turns >= 2) {
        setIsLaughing(true)
        window.clearTimeout(laughTimeoutRef.current)
        laughTimeoutRef.current = window.setTimeout(() => setIsLaughing(false), 1100)
        tracker.turns = 0
        tracker.direction = 0
        tracker.lastTurnAt = 0
      }
    }

    tracker.direction = direction
  }

  const playNoAnimation = () => {
    if (isSayingNoRef.current) return

    window.clearTimeout(laughTimeoutRef.current)
    isSayingNoRef.current = true
    setIsLaughing(false)
    setIsSayingNo(true)

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      noAnimationsRef.current = eyeRefs.current
        .filter((eye): eye is HTMLSpanElement => eye !== null)
        .map((eye) =>
          eye.animate(
            [
              { left: '0px' },
              { left: '5px' },
              { left: '-5px' },
              { left: '5px' },
              { left: '-5px' },
              { left: '0px' },
            ],
            { duration: 750, easing: 'linear' },
          ),
        )
    }

    noTimeoutRef.current = window.setTimeout(() => {
      isSayingNoRef.current = false
      setIsSayingNo(false)
      noAnimationsRef.current.forEach((animation) => animation.cancel())
      noAnimationsRef.current = []
    }, 750)
  }

  const startBallDrag = (ballId: number, event: React.PointerEvent<HTMLButtonElement>) => {
    const toyBox = toyBoxRef.current
    if (
      !toyBox ||
      ballPointerIdRef.current !== null ||
      activeBallIdRef.current !== null ||
      event.button !== 0
    ) return

    const bounds = toyBox.getBoundingClientRect()
    const position = clampBallPosition(
      { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
      toyBox,
    )
    if (!position) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    ballPointerIdRef.current = event.pointerId
    activeBallIdRef.current = ballId
    ballDragSamplesRef.current = []
    recordBallPointerSample(event.clientX, event.clientY)
    clearBallReleaseReaction()
    setIsBallFalling(
      ballsRef.current.some((ball) => ball.id !== ballId && ball.isFalling),
    )
    updateBall(ballId, { position, velocityX: 0, velocityY: 0, isFalling: false })
    window.clearTimeout(laughTimeoutRef.current)
    setIsLaughing(false)
    setIsSurprised(true)
  }

  const moveBall = (ballId: number, event: React.PointerEvent<HTMLButtonElement>) => {
    const toyBox = toyBoxRef.current
    if (
      !toyBox ||
      ballPointerIdRef.current !== event.pointerId ||
      activeBallIdRef.current !== ballId
    ) return

    const bounds = toyBox.getBoundingClientRect()
    const position = clampBallPosition(
      { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
      toyBox,
    )
    if (!position) return

    recordBallPointerSample(event.clientX, event.clientY)
    updateBall(ballId, { position })
  }

  const endBallDrag = (ballId: number, event: React.PointerEvent<HTMLButtonElement>) => {
    if (
      ballPointerIdRef.current !== event.pointerId ||
      activeBallIdRef.current !== ballId
    ) return

    const toyBox = toyBoxRef.current
    if (event.type === 'pointerup' && toyBox) {
      const bounds = toyBox.getBoundingClientRect()
      const position = clampBallPosition(
        { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
        toyBox,
      )
      if (position) updateBall(ballId, { position })
    }

    const draggedBall = ballsRef.current.find((ball) => ball.id === ballId)
    const wasReleasedOnSora = isPositionOverSora(draggedBall?.position ?? null)
    ballPointerIdRef.current = null
    activeBallIdRef.current = null
    if (wasReleasedOnSora) {
      takeBall(ballId)
      return
    }

    showBallReleaseReaction()
    if (event.type === 'pointerup') {
      recordBallPointerSample(event.clientX, event.clientY)
      const samples = ballDragSamplesRef.current
      const firstSample = samples[0]
      const lastSample = samples[samples.length - 1]
      const elapsed =
        firstSample && lastSample ? (lastSample.time - firstSample.time) / 1000 : 0

      if (elapsed >= 0.025) {
        updateBall(ballId, {
          velocityX: Math.max(-1600, Math.min(1600, (lastSample.x - firstSample.x) / elapsed)),
          velocityY: Math.max(-1600, Math.min(1600, (lastSample.y - firstSample.y) / elapsed)),
          isFalling: true,
        })
      }
    } else {
      updateBall(ballId, { velocityX: 0, velocityY: 0, isFalling: true })
    }
    ballDragSamplesRef.current = []
    setIsSurprised(false)
    setIsBallFalling(true)
  }

  const releaseKeyboardBall = (ballId: number) => {
    if (activeBallIdRef.current !== ballId) return

    const ball = ballsRef.current.find((item) => item.id === ballId)
    const wasReleasedOnSora = isPositionOverSora(ball?.position ?? null)
    activeBallIdRef.current = null

    if (wasReleasedOnSora) {
      takeBall(ballId)
      return
    }

    updateBall(ballId, { velocityX: 0, velocityY: 0, isFalling: true })
    setIsSurprised(false)
    showBallReleaseReaction()
    setIsBallFalling(true)
  }

  const showLaughingMouth = isLaughing || isBallOverSora || isHappyAfterTakingBall
  const showSurprisedMouth = isSurprised && !isBallOverSora
  const showSadMouth = isSadAfterBallRelease && !isBallOverSora

  return (
    <div className="mt-10 flex w-full max-w-xl items-end justify-between pr-2">
      <button
        type="button"
        aria-label="Click Sora to make him say no, or wiggle to make him laugh"
        ref={faceRef}
        className="relative flex aspect-square w-28 cursor-pointer items-center justify-center gap-3 rounded-[1.5rem] border-0 bg-[#8FADFF] p-0 shadow-[0_12px_36px_rgba(143,173,255,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FADFF]"
        onPointerEnter={startWiggleTracking}
        onPointerMove={trackWiggle}
        onPointerLeave={() => {
          wiggleRef.current = { lastX: 0, direction: 0, turns: 0, lastTurnAt: 0 }
        }}
        onClick={playNoAnimation}
      >
        {[0, 1].map((eye) => (
          <span
            key={eye}
            ref={(element) => {
              eyeRefs.current[eye] = element
            }}
            className={`about-pet-eye relative size-8 rounded-full bg-[#070707] transition-transform duration-100 ease-out ${
              isSayingNo ? 'is-saying-no' : ''
            } ${isLaughing ? 'is-laughing' : ''} ${
              isSadAfterBallRelease ? 'is-release-blinking' : ''
            } ${isHappyAfterTakingBall ? 'is-happy' : ''}`}
            style={{
              transform: 'translate(var(--gaze-x, 0px), var(--gaze-y, 0px))',
            }}
          >
            <span className="about-pet-eye__line about-pet-eye__line--top" />
            <span className="about-pet-eye__line about-pet-eye__line--bottom" />
            {isHappyAfterTakingBall && (
              <svg
                aria-hidden="true"
                viewBox="0 0 36 28"
                className="about-pet-eye__happy-arc"
              >
                <path
                  d={soraArcPath}
                  fill="none"
                  stroke="#070707"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
        ))}
        <span
          aria-hidden="true"
          className={`about-pet-mouth ${
            showLaughingMouth || showSurprisedMouth || showSadMouth ? 'is-visible' : ''
          } ${showLaughingMouth ? 'is-laughing' : ''} ${
            showSurprisedMouth ? 'is-surprised' : ''
          } ${
            showSadMouth ? 'is-sad' : ''
          }`}
        >
          {showSadMouth && (
            <svg
              aria-hidden="true"
              viewBox="0 0 36 28"
              className="about-pet-mouth__sad-arc"
            >
              <path
                d={soraArcPath}
                fill="none"
                stroke="#070707"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </button>
      <div ref={toyBoxRef} className="relative h-16 w-36 shrink-0 sm:w-64">
        <svg
          aria-hidden="true"
          viewBox="0 0 256 64"
          preserveAspectRatio="none"
          className="h-full w-full text-[#8FADFF]"
        >
          <path
            d="M4 4 V48 Q4 62 18 62 H238 Q252 62 252 48 V4"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {balls.map((ball) => (
          <button
            key={ball.id}
            type="button"
            aria-label={`Pick up ball ${ball.id + 1} to surprise Sora`}
            className={`absolute z-10 size-6 touch-none rounded-full border-2 border-[#8FADFF] bg-[#f5f5f5] shadow-[0_1px_4px_rgba(7,7,7,0.4)] ${
              isSurprised && activeBallIdRef.current === ball.id
                ? 'cursor-grabbing'
                : 'cursor-grab'
            } ${ball.position ? '' : 'bottom-1 left-1/2 -translate-x-1/2'}`}
            style={
              ball.position
                ? {
                    left: ball.position.x,
                    top: ball.position.y,
                    transform: 'translate(-50%, -50%)',
                  }
                : undefined
            }
            onPointerDown={(event) => startBallDrag(ball.id, event)}
            onPointerMove={(event) => moveBall(ball.id, event)}
            onPointerUp={(event) => endBallDrag(ball.id, event)}
            onPointerCancel={(event) => endBallDrag(ball.id, event)}
            onLostPointerCapture={(event) => endBallDrag(ball.id, event)}
            onKeyDown={(event) => {
              if (
                (event.key === ' ' || event.key === 'Enter') &&
                !event.repeat &&
                (activeBallIdRef.current === null || activeBallIdRef.current === ball.id)
              ) {
                event.preventDefault()
                activeBallIdRef.current = ball.id
                clearBallReleaseReaction()
                window.clearTimeout(laughTimeoutRef.current)
                setIsLaughing(false)
                updateBall(ball.id, { velocityX: 0, velocityY: 0, isFalling: false })
                setIsBallFalling(
                  ballsRef.current.some((item) => item.id !== ball.id && item.isFalling),
                )
                setIsSurprised(true)
              }
            }}
            onKeyUp={(event) => {
              if (event.key === ' ' || event.key === 'Enter') {
                releaseKeyboardBall(ball.id)
              }
            }}
            onBlur={() => {
              if (ballPointerIdRef.current === null && activeBallIdRef.current === ball.id) {
                releaseKeyboardBall(ball.id)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
