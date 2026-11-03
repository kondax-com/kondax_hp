import { describe, expect, it } from 'vitest'
import {
  clamp,
  damp,
  resolveScenePose,
  resolveTransitionPose,
  type SceneAnchor,
  type SceneVisualPose,
} from './scene-timeline'

const anchors: SceneAnchor[] = [
  { x: 900, y: 500, size: 500, chapter: 0, morph: 0, opacity: 1 },
  { x: 300, y: 1800, size: 350, chapter: 1, morph: 0.55, opacity: 1 },
  { x: 1000, y: 3400, size: 200, chapter: 2, morph: 1, opacity: 0.13 },
]

describe('continuous scroll scene', () => {
  it('reaches the same damping position at 30, 60 and 120Hz', () => {
    const result = (fps: number) => {
      let value = 0
      for (let i = 0; i < fps; i++) value = damp(value, 1, 8, 1 / fps)
      return value
    }
    expect(result(30)).toBeCloseTo(result(60), 12)
    expect(result(120)).toBeCloseTo(result(60), 12)
  })

  it('resolves backward scrolling directly without accumulating prior motion', () => {
    const initial = resolveScenePose(anchors, 0, 1000)
    resolveScenePose(anchors, 2800, 1000)
    resolveScenePose(anchors, 700, 1000)
    expect(resolveScenePose(anchors, 0, 1000)).toEqual(initial)
    expect(anchors[0].y).toBe(500)
  })

  it('keeps a fast scroll jump at the final shape instead of extrapolating', () => {
    expect(resolveScenePose(anchors, 9000, 1000)).toEqual({
      ...anchors[2],
      y: -5600,
    })
  })

  it('interpolates morph and chapter inside their neighboring ranges', () => {
    const result = resolveScenePose(anchors, 700, 1000)!
    expect(result.morph).toBeGreaterThan(0)
    expect(result.morph).toBeLessThan(0.55)
    expect(result.chapter).toBeGreaterThan(0)
    expect(result.chapter).toBeLessThan(1)
  })

  it('lands beside the service text before completing its shape transformation', () => {
    const flight = [
      { ...anchors[0], kind: 'hero' },
      { ...anchors[1], kind: 'services' },
    ]
    const result = resolveScenePose(flight, 850, 1000)!
    expect(result.x).toBe(300)
    expect(result.y).toBe(950)
    expect(result.morph).toBeLessThan(0.55)
    expect(resolveScenePose(flight, 850, 1000)).toEqual(result)
  })

  it('reframes after a viewport height change and handles a page without anchors', () => {
    expect(resolveScenePose(anchors, 700, 600)).not.toEqual(
      resolveScenePose(anchors, 700, 1000),
    )
    expect(resolveScenePose([], 0, 1000)).toBeNull()
  })

  it('clamps a background-tab time gap and nonfinite input', () => {
    expect(damp(0, 1, 8, 10)).toBe(damp(0, 1, 8, 0.05))
    expect(clamp(Number.NaN)).toBe(0)
  })

  it('keeps the sculpture beside a long services section until its exit', () => {
    const service = { ...anchors[1], kind: 'services', holdUntil: 3000 }
    const flight = [anchors[0], service, anchors[2]]
    const middle = resolveScenePose(flight, 1900, 1000)!
    expect(middle.x).toBe(service.x)
    expect(middle.size).toBe(service.size)
    expect(middle.opacity).toBe(1)
    expect(middle.morph).toBe(service.morph)
    const leaving = resolveScenePose(flight, 2700, 1000)!
    expect(leaving.x).toBeGreaterThan(service.x)
    expect(leaving.x).toBeLessThan(anchors[2].x)
    expect(resolveScenePose(flight, 1900, 1000)).toEqual(middle)
  })
})

const visual: SceneVisualPose = {
  x: 900,
  y: 400,
  size: 420,
  rotationX: 0.2,
  rotationY: -0.3,
  rotationZ: -0.18,
  morph: 0.4,
  chapter: 1,
  opacity: 1,
}

describe('route transition pose continuity', () => {
  it('keeps visible motion while readiness holds the cover at one', () => {
    const first = resolveTransitionPose(visual, visual, 1, 1, 1440, 900)
    const later = resolveTransitionPose(visual, visual, 2, 1, 1440, 900)
    expect(later.rotationY - first.rotationY).toBeCloseTo(0.26)
    expect(later.x).not.toBe(first.x)
    expect(later.morph).not.toBe(first.morph)
    expect(later.opacity).toBe(0.82)
  })

  it('does not move the held sculpture when the destination DOM changes', () => {
    const source = resolveTransitionPose(visual, visual, 1, 1, 1440, 900)
    const destination = resolveTransitionPose(
      { ...visual, x: 200, y: 50, rotationY: 2.5, morph: 1 },
      visual,
      1,
      1,
      1440,
      900,
    )
    expect(destination.x).toBeCloseTo(source.x)
    expect(destination.y).toBeCloseTo(source.y)
    expect(destination.rotationY).toBeCloseTo(source.rotationY)
    expect(destination.morph).toBeCloseTo(source.morph)
  })

  it('reveals through the nearest angle after a long readiness wait', () => {
    const held = resolveTransitionPose(visual, visual, 100, 1, 1440, 900)
    const reveal = resolveTransitionPose(
      visual,
      visual,
      100,
      0.99,
      1440,
      900,
      held,
    )
    expect(Math.abs(reveal.rotationY - held.rotationY)).toBeLessThan(0.04)
    const finished = resolveTransitionPose(
      visual,
      visual,
      100.5,
      0,
      1440,
      900,
      held,
    )
    expect(Math.sin(finished.rotationY)).toBeCloseTo(Math.sin(visual.rotationY))
    expect(finished.x).toBe(visual.x)
  })
})
