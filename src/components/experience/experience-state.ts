export type TransitionPhase =
  'idle' | 'preparing' | 'covering' | 'committing' | 'revealing' | 'recovering'

/** One channel per mounted layout; no motion state is shared between SSR requests. */
export type TransitionSignal = {
  progress: number
  phase: TransitionPhase
  originX: number
  originY: number
  paused: boolean
  reducedMotion: boolean
  requestId: number
  listeners: Set<() => void>
}

export function createTransitionSignal(): TransitionSignal {
  return {
    progress: 0,
    phase: 'idle',
    originX: 0.5,
    originY: 0.5,
    paused: false,
    reducedMotion: false,
    requestId: 0,
    listeners: new Set(),
  }
}

export function notifyTransition(signal: TransitionSignal) {
  for (const listener of signal.listeners) listener()
}

/** Positions and size use CSS pixels in the full viewport; rotations use radians. */
export type SceneFrame = {
  time: number
  delta: number
  width: number
  height: number
  centerX: number
  centerY: number
  size: number
  rotationX: number
  rotationY: number
  rotationZ: number
  morph: number
  chapter: number
  velocity: number
  pointerX: number
  pointerY: number
  focus: number
  opacity: number
  transition: number
  originX: number
  originY: number
  compact: boolean
  reducedMotion: boolean
}

export type ExperienceRenderer = {
  render: (frame: SceneFrame) => void
  resize: (width: number, height: number, pixelRatio: number) => void
  dispose: () => void
}
