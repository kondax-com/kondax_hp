export type SceneAnchor = {
  kind?: string
  x: number
  y: number
  size: number
  chapter: number
  morph: number
  opacity: number
  holdUntil?: number
}

export type SceneVisualPose = {
  x: number
  y: number
  size: number
  rotationX: number
  rotationY: number
  rotationZ: number
  morph: number
  chapter: number
  opacity: number
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

export function damp(
  current: number,
  target: number,
  lambda: number,
  delta: number,
) {
  return (
    current +
    (target - current) * (1 - Math.exp(-lambda * clamp(delta, 0, 0.05)))
  )
}

export function smoothProgress(value: number) {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

/** Resolve from absolute section positions, including reverse scroll and jumps. */
export function resolveScenePose(
  anchors: SceneAnchor[],
  scroll: number,
  height: number,
): SceneAnchor | null {
  if (!anchors.length) return null
  const cursor = scroll + height * 0.5
  let index = anchors.findIndex((anchor) => anchor.y > cursor)
  if (index === 0) return { ...anchors[0], y: anchors[0].y - scroll }
  if (index === -1) {
    const last = anchors[anchors.length - 1]
    return { ...last, y: last.y - scroll }
  }
  const a = anchors[index - 1]
  const b = anchors[index]
  const departure = Math.max(a.y, Math.min(a.holdUntil ?? a.y, b.y - 1))
  const linear = clamp((cursor - departure) / Math.max(1, b.y - departure))
  const t = smoothProgress(linear)
  const mix = (start: number, end: number) => start + (end - start) * t
  // Land in the service illustration before its heading enters the flight path.
  // Shape and lighting continue their slower, scroll-linked transformation.
  const positionT =
    a.kind === 'hero' && b.kind === 'services'
      ? smoothProgress(linear * 1.55)
      : t
  const position = (start: number, end: number) =>
    start + (end - start) * positionT
  return {
    kind: linear === 0 ? a.kind : undefined,
    x: position(a.x, b.x),
    y: position(a.y, b.y) - scroll,
    size: position(a.size, b.size),
    chapter: a.chapter + (b.chapter - a.chapter) * linear,
    morph: mix(a.morph, b.morph),
    opacity: mix(a.opacity, b.opacity),
  }
}

function nearAngle(angle: number, reference: number) {
  return (
    reference +
    Math.atan2(Math.sin(angle - reference), Math.cos(angle - reference))
  )
}

/** The carrier keeps moving while route readiness holds progress at one. */
export function resolveTransitionPose(
  base: SceneVisualPose,
  source: SceneVisualPose,
  age: number,
  progress: number,
  width: number,
  height: number,
  revealRotation?: Pick<
    SceneVisualPose,
    'rotationX' | 'rotationY' | 'rotationZ'
  >,
): SceneVisualPose {
  const blend = clamp(progress)
  const elapsed = Math.max(0, age)
  const scale = Math.min(width, height)
  const carrier: SceneVisualPose = {
    x: width * (0.5 + Math.sin(elapsed * 0.43) * 0.025),
    y: height * (0.49 + Math.sin(elapsed * 0.37) * 0.022),
    size: scale * (0.66 + Math.sin(elapsed * 0.5) * 0.025),
    rotationX: source.rotationX + 0.3 + Math.sin(elapsed * 0.48) * 0.18,
    rotationY: source.rotationY + 0.7 + elapsed * 0.26,
    rotationZ: source.rotationZ - 0.24 + Math.sin(elapsed * 0.34) * 0.13,
    morph: clamp(0.6 + Math.sin(elapsed * 0.46 + source.morph * 2) * 0.22),
    chapter: source.chapter + Math.sin(elapsed * 0.2) * 0.2,
    opacity: 0.82,
  }
  const mix = (from: number, to: number) => from + (to - from) * blend
  const angle = (key: 'rotationX' | 'rotationY' | 'rotationZ') => {
    const target = revealRotation
      ? nearAngle(base[key], revealRotation[key])
      : base[key]
    return mix(target, carrier[key])
  }
  return {
    x: mix(base.x, carrier.x),
    y: mix(base.y, carrier.y),
    size:
      mix(base.size, carrier.size) + Math.sin(blend * Math.PI) * scale * 0.12,
    rotationX: angle('rotationX'),
    rotationY: angle('rotationY'),
    rotationZ: angle('rotationZ'),
    morph: mix(base.morph, carrier.morph),
    chapter: mix(base.chapter, carrier.chapter),
    opacity: mix(base.opacity, carrier.opacity),
  }
}
