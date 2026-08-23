import React from 'react'

/*
 * Renders one side's connector: a short horizontal "branch" for each
 * row, fading from a dot next to the text out toward the sphere.
 * No vertical spine — just the three independent branches.
 *
 * side: 'left' | 'right' — which column this belongs to.
 * branchRefs: a ref whose .current is an array; branchRefs.current[i]
 *   will be set to the DOM node for row i (0 = top, 1 = middle, 2 = bottom)
 *   so the parent can fade each branch in individually with GSAP.
 */
const FeatureConnectorGroup = ({ side, branchRefs }) => {
  const isLeft = side === 'left'
  const rows = [0, 50, 100] // top / middle / bottom, as % down the group

  return (
    <div
      className={`
        pointer-events-none
        absolute
        top-0
        h-full
        w-[230px]
        overflow-visible

        ${
          isLeft
            ? 'left-full ml-2'
            : 'right-full mr-2'
        }
      `}
    >

      {/* -----------------------------------
          HORIZONTAL BRANCHES + DOTS
          One per row. Each branch fades to
          transparent as it nears the sphere
          side, so it dissolves into the object
          instead of hitting it with a hard edge.
      ----------------------------------- */}

      {rows.map((topPercent, index) => (
        <div
          key={topPercent}
          ref={(element) => {
            branchRefs.current[index] = element
          }}
          className="absolute left-0 w-full"
          style={{ top: `${topPercent}%` }}
        >

          <div
            className="h-px w-full"
            style={{
              background: isLeft
                ? 'linear-gradient(to right, rgba(255,255,255,0.35), rgba(255,255,255,0))'
                : 'linear-gradient(to left, rgba(255,255,255,0.35), rgba(255,255,255,0))',
            }}
          />

          <div
            className="absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-white"
            style={
              isLeft
                ? { left: -2 }
                : { right: -2 }
            }
          />

        </div>
      ))}

    </div>
  )
}

export default FeatureConnectorGroup