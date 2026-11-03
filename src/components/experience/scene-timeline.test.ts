import { describe, expect, it } from 'vitest'
import {
  clamp,
  damp,
  resolveScenePose,
  type SceneAnchor,
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
})
