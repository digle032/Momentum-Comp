import { useEffect, useRef } from 'react'

// ── Shaders ──────────────────────────────────────────────────────────────────

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec2  u_resolution;
  uniform float u_time;
  uniform vec2  u_mouse;

  // ── Hash & noise ──────────────────────────────────────────────────────────
  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 74.9);
    return fract(p.x * p.y);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),                hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 6; i++) {
      v    += amp * smoothNoise(p * freq);
      amp  *= 0.5;
      freq *= 2.07;
    }
    return v;
  }

  // ── Main ─────────────────────────────────────────────────────────────────
  void main() {
    vec2 uv    = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution.xy;
    float t    = u_time * 0.06;

    // Double-layered FBM for rich movement
    vec2 q = vec2(
      fbm(uv + vec2(0.0, 0.0) + t * 0.9),
      fbm(uv + vec2(5.2, 1.3) + t * 0.7)
    );
    vec2 r = vec2(
      fbm(uv + q + vec2(1.7, 9.2) + t * 0.4),
      fbm(uv + q + vec2(8.3, 2.8) + t * 0.3)
    );
    float f = fbm(uv + r + t * 0.2);

    // Base: deep navy-black
    vec3 base    = vec3(0.035, 0.045, 0.095);

    // Accent: teal glow (hsl 170, 80%, 45% ≈ rgb 0.09, 0.81, 0.69)
    vec3 teal    = vec3(0.09, 0.81, 0.69);

    // Secondary: violet
    vec3 violet  = vec3(0.22, 0.12, 0.48);

    // Tertiary: deep indigo
    vec3 indigo  = vec3(0.06, 0.09, 0.28);

    // Mouse proximity glow — subtle warm spot
    float md    = length(uv - mouse);
    float mGlow = smoothstep(0.55, 0.0, md) * 0.18;

    // Compose
    vec3 color = mix(base, indigo,  clamp(f * 1.4, 0.0, 1.0));
    color      = mix(color, violet, clamp(pow(f, 2.2) * 0.55, 0.0, 1.0));
    color      = mix(color, teal,   clamp(pow(f, 3.5) * 0.25 + mGlow, 0.0, 1.0));

    // Keep it dark — clamp luminance
    color *= 0.88;

    // Subtle vignette
    float vig = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 1.6);
    color    *= mix(0.7, 1.0, vig);

    gl_FragColor = vec4(color, 1.0);
  }
`

// ── WebGL helpers ─────────────────────────────────────────────────────────────

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[Shader compile error]', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    throw new Error('Shader compilation failed')
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vs   = compileShader(gl, gl.VERTEX_SHADER,   VERTEX_SHADER)
  const fs   = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[Program link error]', gl.getProgramInfoLog(prog))
    throw new Error('Program link failed')
  }
  return prog
}

// ── Hook ─────────────────────────────────────────────────────────────────────

function useShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) {
      console.warn('[AnimatedShaderBackground] WebGL not supported, falling back to CSS gradient.')
      canvas.style.background = 'hsl(224, 71%, 4%)'
      return
    }

    let program: WebGLProgram
    try {
      program = createProgram(gl)
    } catch {
      return
    }

    gl.useProgram(program)

    // Full-screen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // Uniforms
    const uResolution = gl.getUniformLocation(program, 'u_resolution')
    const uTime       = gl.getUniformLocation(program, 'u_time')
    const uMouse      = gl.getUniformLocation(program, 'u_mouse')

    let mouse = { x: 0, y: 0 }
    let raf: number
    let startTime = performance.now()

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width  = canvas.clientWidth  * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    // Mouse handler
    const onPointerMove = (e: PointerEvent) => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      mouse = {
        x: e.clientX * dpr,
        y: (window.innerHeight - e.clientY) * dpr, // flip Y for WebGL
      }
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // Render loop
    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uTime,       elapsed)
      gl.uniform2f(uMouse,      mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      gl.deleteBuffer(buf)
      gl.deleteProgram(program)
    }
  }, [])

  return canvasRef
}

// ── Component ─────────────────────────────────────────────────────────────────

const AnimatedShaderBackground: React.FC = () => {
  const canvasRef = useShaderBackground()

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

export default AnimatedShaderBackground
