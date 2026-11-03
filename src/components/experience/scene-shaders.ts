export const ribbonVertexShader = /* glsl */ `
  attribute vec3 aOrbitPosition;
  attribute vec3 aOrbitNormal;
  attribute vec3 aFlowPosition;
  attribute vec3 aFlowNormal;
  uniform float uMorph;
  uniform float uTime;
  uniform float uVelocity;
  uniform float uChapter;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec3 safeNormal(vec3 value, vec3 fallback) {
    float lengthSquared = dot(value, value);
    return lengthSquared > 0.000001 ? value * inversesqrt(lengthSquared) : fallback;
  }

  void main() {
    vUv = uv;
    float first = smoothstep(0.0, 0.5, uMorph);
    float second = smoothstep(0.5, 1.0, uMorph);
    vec3 p = mix(mix(position, aOrbitPosition, first), aFlowPosition, second);
    vec3 n = safeNormal(mix(mix(normal, aOrbitNormal, first), aFlowNormal, second), normal);

    // Morph attributes, deformation and this Jacobian correction use object space.
    float phase = uTime * 0.24 + uChapter * 0.18;
    float amplitudeX = 0.028 + abs(uVelocity) * 0.012;
    float amplitudeZ = 0.023 + abs(uVelocity) * 0.008;
    float dxdy = amplitudeX * 1.8 * cos(p.y * 1.8 + phase) + uVelocity * 0.018;
    float dzdy = amplitudeZ * 1.3 * cos(p.y * 1.3 - phase);
    p.x += amplitudeX * sin(p.y * 1.8 + phase) + uVelocity * 0.018 * p.y;
    p.z += amplitudeZ * sin(p.y * 1.3 - phase);
    n = vec3(n.x, n.y - dxdy * n.x - dzdy * n.z, n.z);
    vNormal = safeNormal(normalMatrix * n, vec3(0.0, 0.0, 1.0));
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`

export const ribbonFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uFocus;
  uniform float uChapter;
  uniform float uOpacity;
  uniform vec2 uPointer;
  uniform vec3 uSilver;
  uniform vec3 uIndigo;
  uniform vec3 uLilac;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    // The camera, reflection and all light vectors are in view space.
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);
    vec3 R = reflect(-V, N);
    float facing = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 3.0);
    vec3 key = normalize(vec3(-0.45 + uPointer.x * 0.3, 0.7 + uPointer.y * 0.25, 0.8));

    float tint = 0.5 + 0.5 * sin(vUv.x * 18.8496 + R.y * 2.5 + uTime * 0.06 + uChapter * 0.32);
    vec3 base = mix(uSilver, mix(uLilac, uIndigo, tint), 0.24 + 0.26 * tint);
    vec3 environment = mix(vec3(0.075, 0.09, 0.16), vec3(0.83, 0.86, 1.0), smoothstep(-0.8, 0.8, R.y));
    float softbox = pow(max(dot(R, key), 0.0), 12.0);
    float strip = exp(-pow((R.x + 0.18 - uPointer.x * 0.08) * 6.0, 2.0)) * smoothstep(-0.3, 0.8, R.y);
    float edgebox = pow(max(dot(R, normalize(vec3(0.8, -0.25, 0.7))), 0.0), 20.0);
    float diffuse = 0.35 + 0.6 * max(dot(N, key), 0.0);
    vec3 color = base * (environment * 0.82 + diffuse * 0.26);
    color += vec3(1.0, 0.98, 1.0) * (softbox * 0.7 + strip * 0.4);
    color += uIndigo * edgebox * 0.55;
    color = mix(color, uLilac * 0.6 + vec3(0.3), fresnel * 0.36);

    // Screen-space derivatives keep the moving fine lines stable on mobile DPRs.
    float filament = vUv.y * 44.0;
    float lineWidth = max(fwidth(filament), 0.015);
    float line = 1.0 - smoothstep(0.02, 0.02 + lineWidth, abs(fract(filament) - 0.5));
    float flow = pow(0.5 + 0.5 * sin(vUv.x * 37.6991 - uTime * 0.35), 14.0);
    color += (line * 0.035 + flow * (0.045 + uFocus * 0.12)) * uLilac;
    color += uLilac * fresnel * uFocus * 0.12;
    gl_FragColor = vec4(color, uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export const portalVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const portalFragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uOrigin;
  uniform vec3 uCover;
  uniform vec3 uLilac;
  uniform vec3 uIndigo;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - uOrigin) * vec2(uAspect, 1.0);
    float distanceFromOrigin = length(p);
    float radius = pow(uProgress, 0.74) * (length(vec2(uAspect, 1.0)) + 0.3);
    float coverage = (1.0 - smoothstep(radius - 0.12, radius + 0.16, distanceFromOrigin)) * smoothstep(0.0, 0.12, uProgress);

    vec2 q = p + vec2(sin(p.y * 4.0 + uTime * 0.16), cos(p.x * 3.0 - uTime * 0.12)) * 0.11;
    float field = 0.5 + 0.25 * sin(q.x * 7.0 + q.y * 4.0 - uTime * 0.24)
      + 0.25 * sin(q.y * 9.0 - q.x * 2.0 + uTime * 0.17);
    float contourCoordinate = distanceFromOrigin * 18.0 - uTime * 0.2 + field * 2.0;
    float derivativeWidth = max(fwidth(contourCoordinate), 0.02);
    float contour = 1.0 - smoothstep(0.015, 0.015 + derivativeWidth, abs(fract(contourCoordinate) - 0.5));
    float edge = exp(-pow((distanceFromOrigin - radius) * 20.0, 2.0));
    vec3 color = mix(uCover, uLilac, field * 0.19);
    color = mix(color, uIndigo, contour * 0.035);
    color += vec3(0.05) * edge;
    float settled = smoothstep(0.78, 1.0, uProgress);
    color = mix(color, uCover, settled);
    coverage = mix(coverage, 1.0, settled);
    gl_FragColor = vec4(color, coverage);
    #include <colorspace_fragment>
  }
`
