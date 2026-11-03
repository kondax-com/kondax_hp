import {
  ACESFilmicToneMapping,
  BufferGeometry,
  Color,
  Curve,
  Float32BufferAttribute,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

export type FlowController = {
  setPaused: (paused: boolean) => void
  dispose: () => void
}

type Options = {
  paused: boolean
  onReady: () => void
  onError: () => void
}

class FlowCurve extends Curve<Vector3> {
  constructor() {
    super()
  }

  getPoint(t: number, target = new Vector3()) {
    const angle = t * Math.PI * 2
    return target.set(
      (Math.sin(angle) + 2 * Math.sin(2 * angle)) * 0.44,
      (Math.cos(angle) - 2 * Math.cos(2 * angle)) * 0.44,
      -Math.sin(3 * angle) * 0.52,
    )
  }
}

function createRibbonGeometry(segments: number) {
  const curve = new FlowCurve()
  const frames = curve.computeFrenetFrames(segments, true)
  const sides = 20
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const center = new Vector3()
  const widthAxis = new Vector3()
  const depthAxis = new Vector3()
  const point = new Vector3()

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    curve.getPointAt(t, center)
    const twist = t * Math.PI * 4 + 0.3 * Math.sin(t * Math.PI * 6)
    widthAxis
      .copy(frames.normals[i])
      .multiplyScalar(Math.cos(twist))
      .addScaledVector(frames.binormals[i], Math.sin(twist))
    depthAxis
      .copy(frames.binormals[i])
      .multiplyScalar(Math.cos(twist))
      .addScaledVector(frames.normals[i], -Math.sin(twist))

    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2
      // A rounded, flattened cross-section gives the continuous strand a ribbon edge.
      const x =
        Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.55) * 0.29
      const y =
        Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.55) * 0.075
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
  geometry.computeBoundingSphere()
  if (geometry.boundingSphere) geometry.boundingSphere.radius += 0.12
  return geometry
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    // The displacement and inverse-transpose normal correction are in object space.
    float phase = uTime * .24;
    vec3 p = position;
    p.x += .035 * sin(position.y * 1.8 + phase);
    p.z += .025 * sin(position.y * 1.3 - phase);
    float dxdy = .063 * cos(position.y * 1.8 + phase);
    float dzdy = .0325 * cos(position.y * 1.3 - phase);
    vec3 correctedNormal = vec3(normal.x, normal.y - dxdy * normal.x - dzdy * normal.z, normal.z);
    vNormal = normalize(normalMatrix * correctedNormal);
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSilver;
  uniform vec3 uIndigo;
  uniform vec3 uLilac;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    // All lighting directions and normals use view space.
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);
    vec3 R = reflect(-V, N);
    float facing = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 3.0);

    float tint = .5 + .5 * sin(vUv.x * 18.8496 + R.y * 2.5 + uTime * .06);
    vec3 base = mix(uSilver, mix(uLilac, uIndigo, tint), .24 + .26 * tint);
    float sky = smoothstep(-.8, .8, R.y);
    vec3 environment = mix(vec3(.075, .09, .16), vec3(.83, .86, 1.0), sky);
    float softbox = pow(max(dot(R, normalize(vec3(-.45, .7, .8))), 0.0), 12.0);
    float strip = exp(-pow((R.x + .18) * 6.0, 2.0)) * smoothstep(-.3, .8, R.y);
    float edgebox = pow(max(dot(R, normalize(vec3(.8, -.25, .7))), 0.0), 20.0);
    float diffuse = .35 + .6 * max(dot(N, normalize(vec3(-.5, .8, 1.0))), 0.0);
    vec3 color = base * (environment * .82 + diffuse * .26);
    color += vec3(1.0, .98, 1.0) * (softbox * .7 + strip * .4);
    color += uIndigo * edgebox * .55;
    color = mix(color, uLilac * .6 + vec3(.3), fresnel * .36);

    // Fine flowing filaments are anti-aliased in screen space, without texture requests.
    float filament = vUv.y * 44.0;
    float lineWidth = max(fwidth(filament), .015);
    float line = 1.0 - smoothstep(.02, .02 + lineWidth, abs(fract(filament) - .5));
    float flow = pow(.5 + .5 * sin(vUv.x * 37.6991 - uTime * .35), 14.0);
    color += (line * .035 + flow * .035) * uLilac;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function createFlowRenderer(
  host: HTMLElement,
  options: Options,
): FlowController {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  if (!context) return { setPaused() {}, dispose() {} }

  const compact = window.matchMedia('(max-width: 700px)').matches
  const renderer = new WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: true,
  })
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 1.8),
  )
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  renderer.debug.checkShaderErrors = true

  let shaderFailed = false
  renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
    shaderFailed = true
    console.error('KONDAX ribbon shader failed to compile.', {
      program: gl.getProgramInfoLog(program),
      vertex: gl.getShaderInfoLog(vertex),
      fragment: gl.getShaderInfoLog(fragment),
    })
  }

  const scene = new Scene()
  const camera = new PerspectiveCamera(34, 1, 0.1, 30)
  camera.position.set(0, 0.02, 6.5)
  const geometry = createRibbonGeometry(compact ? 240 : 400)
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSilver: { value: new Color('#d7ddf1') },
      uIndigo: { value: new Color('#4b55ec') },
      uLilac: { value: new Color('#b4baff') },
    },
    vertexShader,
    fragmentShader,
  })
  const ribbon = new Mesh(geometry, material)
  scene.add(ribbon)
  host.appendChild(canvas)

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const pointerMedia = window.matchMedia('(pointer: fine)')
  const target = new Vector2()
  const pointer = new Vector2()
  let paused = options.paused
  let visible = true
  let disposed = false
  let contextLost = false
  let time = 0
  let lastTime = 0
  let announcedReady = false

  function draw(timestamp: number) {
    if (disposed || contextLost) return
    const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0
    lastTime = timestamp
    const moving = !paused && !reducedMotion.matches
    if (moving) time += delta
    pointer.lerp(target, 0.04)
    material.uniforms.uTime.value = time
    ribbon.rotation.set(
      0.22 + Math.sin(time * 0.16) * 0.06 + pointer.y * 0.08,
      -0.32 + Math.sin(time * 0.12) * 0.18 + pointer.x * 0.13,
      -0.18,
    )

    try {
      renderer.render(scene, camera)
      if (shaderFailed) {
        stop()
        options.onError()
        return
      }
      if (!announcedReady) {
        announcedReady = true
        options.onReady()
      }
    } catch (error) {
      shaderFailed = true
      stop()
      console.warn('KONDAX: the decorative 3D scene is unavailable.', error)
      options.onError()
    }
  }

  function stop() {
    renderer.setAnimationLoop(null)
    lastTime = 0
  }

  function animate(timestamp: number) {
    // Recheck at the frame boundary as well as in event handlers: preferences can
    // change while the browser has a queued animation frame.
    if (
      disposed ||
      contextLost ||
      shaderFailed ||
      paused ||
      reducedMotion.matches ||
      !visible ||
      document.hidden
    ) {
      stop()
      return
    }
    draw(timestamp)
  }

  function updateLoop() {
    stop()
    if (disposed || contextLost || shaderFailed || !visible || document.hidden)
      return
    draw(performance.now())
    if (!paused && !reducedMotion.matches && !shaderFailed)
      renderer.setAnimationLoop(animate)
  }

  function resize() {
    const width = host.clientWidth
    const height = host.clientHeight
    if (!width || !height || disposed || contextLost) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // Fit the entire knot in both narrow portrait and wide desktop containers.
    camera.position.z = Math.max(6.15, 5.4 / camera.aspect)
    camera.updateProjectionMatrix()
    if (visible && !document.hidden) draw(performance.now())
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointerMedia.matches || reducedMotion.matches || paused) return
    const bounds = host.getBoundingClientRect()
    target.set(
      ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
      ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1,
    )
  }

  function onPointerLeave() {
    target.set(0, 0)
  }
  function onContextLost(event: Event) {
    event.preventDefault()
    contextLost = true
    stop()
    options.onError()
  }
  function onContextRestored() {
    if (disposed) return
    contextLost = false
    announcedReady = false
    resize()
    updateLoop()
  }

  const sizeObserver = new ResizeObserver(resize)
  sizeObserver.observe(host)
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting)
      updateLoop()
    },
    { threshold: 0.01 },
  )
  visibilityObserver.observe(host)
  host.addEventListener('pointermove', onPointerMove, { passive: true })
  host.addEventListener('pointerleave', onPointerLeave, { passive: true })
  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', onContextRestored)
  document.addEventListener('visibilitychange', updateLoop)
  reducedMotion.addEventListener('change', updateLoop)
  resize()
  updateLoop()

  return {
    setPaused(value) {
      paused = value
      updateLoop()
    },
    dispose() {
      disposed = true
      stop()
      sizeObserver.disconnect()
      visibilityObserver.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      document.removeEventListener('visibilitychange', updateLoop)
      reducedMotion.removeEventListener('change', updateLoop)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
