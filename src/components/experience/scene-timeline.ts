export type SceneAnchor = {
  kind?: string
  x: number
  y: number
  size: number
  chapter: number
  morph: number
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
  const linear = clamp((cursor - a.y) / Math.max(1, b.y - a.y))
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
    x: position(a.x, b.x),
    y: position(a.y, b.y) - scroll,
    size: position(a.size, b.size),
    chapter: a.chapter + (b.chapter - a.chapter) * linear,
    morph: mix(a.morph, b.morph),
    opacity: mix(a.opacity, b.opacity),
  }
}
