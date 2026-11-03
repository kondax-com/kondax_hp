import {
  ACESFilmicToneMapping,
  BufferGeometry,
  Color,
  Curve,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  ShaderMaterial,
  Sphere,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { ExperienceRenderer, SceneFrame } from './experience-state'
import {
  portalFragmentShader,
  portalVertexShader,
  ribbonFragmentShader,
  ribbonVertexShader,
} from './scene-shaders'

type Callbacks = { onReady: () => void; onError: () => void }
type Shape = 0 | 1 | 2

class RibbonCurve extends Curve<Vector3> {
  constructor(private readonly shape: Shape) {
    super()
  }

  // Morph targets share an angular parameter, including their transported frames.
  getTangentAt(t: number, target = new Vector3()) {
    return this.getTangent(t, target)
  }

  getPoint(t: number, target = new Vector3()) {
    const angle = t * Math.PI * 2
    if (this.shape === 0) {
      return target.set(
        (Math.sin(angle) + 2 * Math.sin(2 * angle)) * 0.44,
        (Math.cos(angle) - 2 * Math.cos(2 * angle)) * 0.44,
        -Math.sin(3 * angle) * 0.52,
      )
    }
    if (this.shape === 1) {
      const radius = 1.05 - 0.38 * Math.cos(3 * angle)
      return target.set(
        radius * Math.sin(2 * angle),
        -radius * Math.cos(2 * angle),
        -0.64 * Math.sin(3 * angle),
      )
    }
    return target.set(
      (1.15 - 0.42 * Math.cos(3 * angle)) * Math.sin(2 * angle),
      -(0.65 - 0.3 * Math.cos(3 * angle)) * Math.cos(2 * angle),
      -0.5 * Math.sin(3 * angle),
    )
  }
}

function createSurface(shape: Shape, segments: number, sides: number) {
  const curve = new RibbonCurve(shape)
  const frames = curve.computeFrenetFrames(segments, true)
  const baseFrames =
    shape === 0
      ? frames
      : new RibbonCurve(0).computeFrenetFrames(segments, true)
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const center = new Vector3()
  const widthAxis = new Vector3()
  const depthAxis = new Vector3()
  const point = new Vector3()
  const referenceWidth = new Vector3()
  const referenceDepth = new Vector3()
  const transport = new Quaternion()
  const width = [0.29, 0.23, 0.265][shape]
  const thickness = [0.075, 0.063, 0.056][shape]

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    curve.getPoint(t, center)
    const angle = t * Math.PI * 2
    const twist = angle * 2 + 0.3 * Math.sin(angle * 3)
    widthAxis
      .copy(frames.normals[i])
      .multiplyScalar(Math.cos(twist))
      .addScaledVector(frames.binormals[i], Math.sin(twist))
    depthAxis
      .copy(frames.binormals[i])
      .multiplyScalar(Math.cos(twist))
      .addScaledVector(frames.normals[i], -Math.sin(twist))

    if (shape !== 0) {
      // Transport the same material frame along every target. Matching winding
      // and edge correspondence prevents the ribbon from pinching during morphs.
      referenceWidth
        .copy(baseFrames.normals[i])
        .multiplyScalar(Math.cos(twist))
        .addScaledVector(baseFrames.binormals[i], Math.sin(twist))
      referenceDepth
        .copy(baseFrames.binormals[i])
        .multiplyScalar(Math.cos(twist))
        .addScaledVector(baseFrames.normals[i], -Math.sin(twist))
      transport.setFromUnitVectors(baseFrames.tangents[i], frames.tangents[i])
      widthAxis.copy(referenceWidth).applyQuaternion(transport)
      depthAxis.copy(referenceDepth).applyQuaternion(transport)
    }

    for (let j = 0; j <= sides; j++) {
      const cross = (j / sides) * Math.PI * 2
      const x =
        Math.sign(Math.cos(cross)) *
        Math.pow(Math.abs(Math.cos(cross)), 0.55) *
        width
      const y =
        Math.sign(Math.sin(cross)) *
        Math.pow(Math.abs(Math.sin(cross)), 0.55) *
        thickness
      point
        .copy(center)
        .addScaledVector(widthAxis, x)
        .addScaledVector(depthAxis, y)
      positions.push(point.x, point.y, point.z)
      uvs.push(t, j / sides)
      if (i < segments && j < sides) {
        const current = i * (sides + 1) + j
        const next = current + sides + 1
        indices.push(current, current + 1, next, next, current + 1, next + 1)
      }
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function createMorphGeometry(segments: number, sides: number) {
  const geometry = createSurface(0, segments, sides)
  const orbit = createSurface(1, segments, sides)
  const flow = createSurface(2, segments, sides)
  geometry.setAttribute('aOrbitPosition', orbit.getAttribute('position'))
  geometry.setAttribute('aOrbitNormal', orbit.getAttribute('normal'))
  geometry.setAttribute('aFlowPosition', flow.getAttribute('position'))
  geometry.setAttribute('aFlowNormal', flow.getAttribute('normal'))
  // Enclose all three targets plus velocity deformation, not just the base shape.
  geometry.boundingSphere = new Sphere(new Vector3(), 2.2)
  orbit.dispose()
  flow.dispose()
  return geometry
}

function createOrbitGeometry() {
  const positions: number[] = []
  for (let ring = 0; ring < 3; ring++) {
    for (let i = 0; i < 128; i++) {
      for (const step of [i, i + 1]) {
        const t = (step / 128) * Math.PI * 2
        const radius = 1.7 + ring * 0.19
        positions.push(
          Math.cos(t) * radius,
          Math.sin(t) * radius * 0.76,
          Math.sin(t + ring) * 0.3,
        )
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.computeBoundingSphere()
  return geometry
}

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}
function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, finite(value)))
}
/** Rendering only. The experience provider owns the timeline, inputs and RAF. */
export function createExperienceRenderer(
  host: HTMLElement,
  callbacks: Callbacks,
): ExperienceRenderer | null {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'display:block;width:100%;height:100%;pointer-events:none'
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  if (!context) return null

  let disposed = false
  let contextLost = false
  let ready = false
  let shaderFailed = false
  let renderer: WebGLRenderer | undefined
  const resources: Array<{ dispose: () => void }> = []
  function own<T extends { dispose: () => void }>(resource: T) {
    resources.push(resource)
    return resource
  }
  function onContextLost(event: Event) {
    event.preventDefault()
    contextLost = true
    ready = false
    callbacks.onError()
  }
  function onContextRestored() {
    contextLost = false
    ready = false
  }
  function dispose() {
    if (disposed) return
    disposed = true
    canvas.removeEventListener('webglcontextlost', onContextLost)
    canvas.removeEventListener('webglcontextrestored', onContextRestored)
    for (const resource of resources) resource.dispose()
    renderer?.dispose()
    renderer?.forceContextLoss()
    canvas.remove()
  }

  try {
    renderer = new WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: true,
    })
    const webgl = renderer
    webgl.setClearColor(0x000000, 0)
    webgl.outputColorSpace = SRGBColorSpace
    webgl.toneMapping = ACESFilmicToneMapping
    webgl.toneMappingExposure = 1.25
    webgl.debug.checkShaderErrors = true
    webgl.debug.onShaderError = (gl, program, vertex, fragment) => {
      shaderFailed = true
      console.error('KONDAX experience shader failed to compile.', {
        program: gl.getProgramInfoLog(program),
        vertex: gl.getShaderInfoLog(vertex),
        fragment: gl.getShaderInfoLog(fragment),
      })
    }

    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10000)
    camera.position.z = 3000
    const desktopGeometry = own(createMorphGeometry(384, 24))
    const compactGeometry = own(createMorphGeometry(240, 20))
    const material = own(
      new ShaderMaterial({
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uVelocity: { value: 0 },
          uChapter: { value: 0 },
          uFocus: { value: 0 },
          uOpacity: { value: 1 },
          uPointer: { value: new Vector2() },
          uSilver: { value: new Color('#d7ddf1') },
          uIndigo: { value: new Color('#4b55ec') },
          uLilac: { value: new Color('#b4baff') },
        },
        vertexShader: ribbonVertexShader,
        fragmentShader: ribbonFragmentShader,
        transparent: true,
        forceSinglePass: true,
        depthWrite: true,
      }),
    )
    const sculpture = new Group()
    const ribbon = new Mesh(desktopGeometry, material)
    ribbon.renderOrder = 1
    sculpture.add(ribbon)
    const orbitGeometry = own(createOrbitGeometry())
    const orbitMaterial = own(
      new LineBasicMaterial({
        color: '#a3abe9',
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
    )
    const orbits = new LineSegments(orbitGeometry, orbitMaterial)
    orbits.rotation.set(0.5, -0.15, -0.2)
    sculpture.add(orbits)
    scene.add(sculpture)

    const portalGeometry = own(new PlaneGeometry(2, 2))
    const portalMaterial = own(
      new ShaderMaterial({
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uOrigin: { value: new Vector2(0.5, 0.5) },
          uCover: { value: new Color('#eef0fb') },
          uLilac: { value: new Color('#b4baff') },
          uIndigo: { value: new Color('#4b55ec') },
        },
        vertexShader: portalVertexShader,
        fragmentShader: portalFragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    )
    const portal = new Mesh(portalGeometry, portalMaterial)
    portal.position.z = -600
    portal.renderOrder = -2
    portal.frustumCulled = false
    portal.visible = false
    scene.add(portal)

    let width = 0
    let height = 0
    let pixelRatio = 1
    function resize(nextWidth: number, nextHeight: number, nextRatio: number) {
      if (disposed || contextLost) return
      const w = Math.max(1, finite(nextWidth, 1))
      const h = Math.max(1, finite(nextHeight, 1))
      const dpr = clamp(nextRatio, 0.5, 1.5)
      if (w === width && h === height && dpr === pixelRatio) return
      width = w
      height = h
      pixelRatio = dpr
      webgl.setPixelRatio(dpr)
      webgl.setSize(w, h, false)
      camera.left = -w / 2
      camera.right = w / 2
      camera.top = h / 2
      camera.bottom = -h / 2
      camera.updateProjectionMatrix()
      portal.scale.set(w / 2, h / 2, 1)
      portalMaterial.uniforms.uAspect.value = w / h
    }

    function render(frame: SceneFrame) {
      if (disposed || contextLost || shaderFailed) return
      try {
        if (frame.width !== width || frame.height !== height)
          resize(frame.width, frame.height, pixelRatio)
        const transition = clamp(frame.transition)
        const time = finite(frame.time)
        const opacity = clamp(frame.opacity)
        const focus = clamp(frame.focus)
        const size = clamp(frame.size, 0, Math.max(width, height) * 2)
        const originX = clamp(frame.originX)
        const originY = clamp(frame.originY)
        const x = finite(frame.centerX, width / 2)
        const y = finite(frame.centerY, height / 2)
        sculpture.position.set(x - width / 2, height / 2 - y, transition * 320)
        sculpture.scale.setScalar(size / 3.2)
        sculpture.rotation.set(
          finite(frame.rotationX),
          finite(frame.rotationY),
          finite(frame.rotationZ),
        )
        sculpture.visible = size > 0.5 && opacity > 0.001
        ribbon.geometry = frame.compact ? compactGeometry : desktopGeometry
        material.uniforms.uMorph.value = clamp(frame.morph)
        material.uniforms.uTime.value = time
        material.uniforms.uVelocity.value = frame.reducedMotion
          ? 0
          : clamp(frame.velocity, -3, 3)
        material.uniforms.uChapter.value = finite(frame.chapter)
        material.uniforms.uFocus.value = focus
        material.uniforms.uOpacity.value = opacity
        material.uniforms.uPointer.value.set(
          clamp(frame.pointerX, -1, 1),
          clamp(frame.pointerY, -1, 1),
        )
        orbits.visible = !frame.compact && transition < 0.7
        orbits.rotation.z = -0.2 + finite(frame.chapter) * 0.07
        orbitMaterial.opacity =
          opacity * (0.12 + focus * 0.07) * (1 - transition)

        portal.visible = transition > 0.001
        portalMaterial.uniforms.uProgress.value = transition
        portalMaterial.uniforms.uTime.value = time
        portalMaterial.uniforms.uOrigin.value.set(originX, 1 - originY)
        webgl.render(scene, camera)
        if (shaderFailed) {
          callbacks.onError()
          return
        }
        if (!ready) {
          ready = true
          callbacks.onReady()
        }
      } catch (error) {
        shaderFailed = true
        console.warn('KONDAX: the decorative experience is unavailable.', error)
        callbacks.onError()
      }
    }

    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)
    host.appendChild(canvas)
    return { render, resize, dispose }
  } catch (error) {
    console.warn(
      'KONDAX: the decorative experience could not be initialized.',
      error,
    )
    dispose()
    callbacks.onError()
    return null
  }
}
