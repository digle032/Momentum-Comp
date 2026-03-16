import React, { useId } from 'react'

interface MomentumLogoProps {
  size?: number
}

/**
 * MomentumLogo
 *
 * Calligraphic "M" (Dancing Script 700) with a curved film strip ribbon.
 *
 * Three visual rules:
 *   1. A ~5 px gap separates the M halves from the strip edges — achieved by
 *      masking the M with a version of the strip path expanded outward by 5 px.
 *   2. The strip is shorter than the full viewBox (x 20–240) and its top/bottom
 *      edges follow a quadratic bezier that bows upward ~11 px at the midpoint.
 *   3. Perforation holes track the curve so they stay flush with the strip edges.
 */
const MomentumLogo: React.FC<MomentumLogoProps> = ({ size = 40 }) => {
  const uid = useId().replace(/:/g, '')
  const mMaskId    = `mMask-${uid}`
  const filmClipId = `filmClip-${uid}`
  const perfMaskId = `perfMask-${uid}`

  // ── Strip geometry ─────────────────────────────────────────────────────────
  // Horizontal extent
  const X0 = 20, X1 = 240

  // Quadratic bezier top edge: (X0,122) → control(130,100) → (X1,122)
  //   y(t) = 122 - 44t + 44t²   t = (x − X0) / (X1 − X0)
  // At t=0.5 (x=130): y = 122 − 22 + 11 = 111  →  ~11 px upward bow
  const yTop = (x: number): number => {
    const t = (x - X0) / (X1 - X0)
    return 122 - 44 * t + 44 * t * t
  }
  const yBot = (x: number): number => yTop(x) + 50

  // Actual strip outline
  const stripPath = `M ${X0},122 Q 130,100 ${X1},122 L ${X1},172 Q 130,150 ${X0},172 Z`

  // Expanded outline used to cut the M — adds 5 px on top/bottom and 6 px on sides
  // so there is a clear gap between the letter and the ribbon
  const gapPath = `M ${X0 - 6},117 Q 130,95 ${X1 + 6},117 L ${X1 + 6},177 Q 130,155 ${X0 - 6},177 Z`

  // 12 perforation holes spread across the strip interior
  const perfs = [24, 42, 60, 78, 96, 114, 132, 150, 168, 186, 204, 222]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/*
         * mMask: hides the M inside the (slightly expanded) strip band,
         * creating a clean gap between the letter and the ribbon on both sides.
         */}
        <mask id={mMaskId}>
          <rect x="0" y="0" width="260" height="260" fill="white" />
          <path d={gapPath} fill="black" />
        </mask>

        {/* filmClip: constrains the strip fill to the curved banner shape */}
        <clipPath id={filmClipId}>
          <path d={stripPath} />
        </clipPath>

        {/*
         * perfMask: punches holes in the strip.
         * Each hole's y is derived from the same bezier formula so holes
         * stay anchored near the curved top/bottom edges.
         */}
        <mask id={perfMaskId}>
          <rect x="0" y="90" width="260" height="90" fill="white" />
          {perfs.map((x, i) => (
            <React.Fragment key={i}>
              <rect x={x} y={Math.round(yTop(x) + 4)}  width="12" height="9" rx="1.5" fill="black" />
              <rect x={x} y={Math.round(yBot(x) - 13)} width="12" height="9" rx="1.5" fill="black" />
            </React.Fragment>
          ))}
        </mask>
      </defs>

      {/*
       * ── Calligraphic M ────────────────────────────────────────────────────
       * fontSize 215 gives a slightly bolder letterform.
       * The mMask removes it inside the expanded strip band, leaving only
       * the upper swash loops and lower descenders visible with a clear gap.
       */}
      <text
        x="130"
        y="178"
        fontFamily="'Dancing Script', cursive"
        fontSize="215"
        fontWeight="700"
        fill="#C1522A"
        textAnchor="middle"
        mask={`url(#${mMaskId})`}
      >
        M
      </text>

      {/*
       * ── Curved film strip ─────────────────────────────────────────────────
       * Clipped to the bezier banner shape; perforation mask punches holes.
       */}
      <g clipPath={`url(#${filmClipId})`}>
        <rect
          x="0"
          y="90"
          width="260"
          height="90"
          fill="#C1522A"
          mask={`url(#${perfMaskId})`}
        />
      </g>
    </svg>
  )
}

export default MomentumLogo
