import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ShiruParticles from './ShiruPaticles.jsx'
import FeatureConnectorGroup from './FeatureConnecter.jsx'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    side: 'left',
    position: 'top',
    title: 'Tell SHIRU what you want',
    description:
      'Describe what you need naturally. SHIRU understands your preferences, budget and intent.',
  },

  {
    side: 'left',
    position: 'middle',
    title: 'Smart follow-ups',
    description:
      'SHIRU asks only what matters, refining your search without making you fill endless forms.',
  },

  {
    side: 'left',
    position: 'bottom',
    title: 'Compare everything',
    description:
      'Products from different merchants are brought together so you can see the real trade-offs.',
  },

  {
    side: 'right',
    position: 'top',
    title: 'Discover merchants',
    description:
      'SHIRU searches across available merchants instead of locking you into one store.',
  },

  {
    side: 'right',
    position: 'middle',
    title: 'Best-value reasoning',
    description:
      'Price, ratings, delivery, returns and your preferences are considered before recommending.',
  },

  {
    side: 'right',
    position: 'bottom',
    title: 'Bounded checkout',
    description:
      'SHIRU never spends blindly. Every money action is explainable, gated and user-approved.',
  },
]

// Shared footprint for a text column and its matching connector
// group, so the two always line up exactly.
const COLUMN_WIDTH_CLASSES = 'w-[360px] lg:w-[390px]'

const ShiruFeatures = ({ particleGather }) => {
  const sectionRef = useRef(null)

  const featureRefs = useRef([])

  // Connector branch refs: [row0, row1, row2] per side.
  const leftBranchRefs = useRef([])
  const rightBranchRefs = useRef([])

  const titleRef = useRef(null)
  const subtitleRef = useRef(null)

  // This value is shared with Three.js
  const particleProgress = useRef(0)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const featureElements = featureRefs.current

      // ---------------------------------------
      // INITIAL STATE
      // ---------------------------------------

      gsap.set(featureElements, {
        opacity: 0,
        y: 30,
      })

      gsap.set(
        [
          ...leftBranchRefs.current,
          ...rightBranchRefs.current,
        ],
        { opacity: 0 }
      )

      gsap.set(titleRef.current, {
        opacity: 0,
        y: 35,
      })

      gsap.set(subtitleRef.current, {
        opacity: 0,
        y: 15,
      })

      // ---------------------------------------
      // SCROLL TIMELINE
      // ---------------------------------------

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,

          start: 'top top',

          // More scroll distance = slower animation
          end: '+=2200',

          pin: true,

          scrub: 1,

          anticipatePin: 1,

          // -----------------------------------
          // CONNECT GSAP TO THREE.JS
          // -----------------------------------

          onUpdate: (self) => {
            particleProgress.current = self.progress
          },
        },
      })

      // ---------------------------------------
      // 0 → 20%
      // PARTICLES START GATHERING
      // ---------------------------------------

      tl.to(
        {},
        {
          duration: 0.2,
          ease: 'none',
        }
      )

      // ---------------------------------------
      // 20 → 35%
      // TOP FEATURES + their branches
      // ---------------------------------------

      tl.to(
        [
          featureElements[0],
          featureElements[3],
          leftBranchRefs.current[0],
          rightBranchRefs.current[0],
        ],
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          stagger: 0.08,
          ease: 'power2.out',
        }
      )

      // ---------------------------------------
      // 35 → 50%
      // MIDDLE FEATURES + their branches
      // ---------------------------------------

      tl.to(
        [
          featureElements[1],
          featureElements[4],
          leftBranchRefs.current[1],
          rightBranchRefs.current[1],
        ],
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          stagger: 0.08,
          ease: 'power2.out',
        }
      )

      // ---------------------------------------
      // 50 → 65%
      // BOTTOM FEATURES + their branches
      // ---------------------------------------

      tl.to(
        [
          featureElements[2],
          featureElements[5],
          leftBranchRefs.current[2],
          rightBranchRefs.current[2],
        ],
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          stagger: 0.08,
          ease: 'power2.out',
        }
      )

      // ---------------------------------------
      // 65 → 85%
      // TITLE
      // ---------------------------------------

      tl.to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          ease: 'power2.out',
        }
      )

      // ---------------------------------------
      // 85 → 100%
      // SUBTITLE
      // ---------------------------------------

      tl.to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: 'power2.out',
        }
      )
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="
        relative
        h-screen
        w-full
        overflow-hidden
        bg-black
        text-white
      "
    >

      {/* =====================================
          SHIRU PARTICLES
      ===================================== */}

      <ShiruParticles
        progressRef={particleProgress}
      />


      {/* =====================================
          FEATURE CONTAINER
      ===================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          mx-auto
          w-full
          max-w-[1500px]
        "
      >

        {features.map((feature, index) => {
  const isLeft = feature.side === 'left'

  const verticalPosition =
    index === 0 || index === 3
      ? 'top-[22%]'
      : index === 1 || index === 4
        ? 'top-[43%]'
        : 'top-[64%]'

  const horizontalPosition = isLeft
    ? 'left-[3%] lg:left-[6%]'
    : 'right-[3%] lg:right-[6%]'

  return (
    <div
      key={feature.title}
      ref={(element) => {
        featureRefs.current[index] = element
      }}
      className={`
        absolute
        ${verticalPosition}
        ${horizontalPosition}

        flex
        ${COLUMN_WIDTH_CLASSES}
        items-center

        ${
          isLeft
            ? 'justify-end text-right'
            : 'justify-start text-left'
        }
      `}
    >

      {/* ===============================
          FEATURE TEXT
      =============================== */}

      <div className="w-[245px]">

        <h3
          className="
            text-[12px]
            font-medium
            leading-5
            tracking-tight
            text-white
            md:text-[13.5px]
          "
        >
          {feature.title}
        </h3>

        <p
          className="
            mt-2
            text-[9px]
            leading-[1.6]
            text-white/40
            md:text-[10px]
          "
        >
          {feature.description}
        </p>

      </div>

    </div>
  )
})}

        {/* =====================================
            CONNECTOR GROUPS (one per side)
            Positioned to match the text columns'
            footprint exactly, spanning from the
            top row down to the bottom row, with
            a short fading branch out to each row.
        ===================================== */}

        <div
          className={`
            pointer-events-none
            absolute
            left-[3%]
            lg:left-[6%]
            ${COLUMN_WIDTH_CLASSES}
            top-[calc(22%+26px)]
            bottom-[calc(36%-26px)]
          `}
        >
          <FeatureConnectorGroup
            side="left"
            branchRefs={leftBranchRefs}
          />
        </div>

        <div
          className={`
            pointer-events-none
            absolute
            right-[3%]
            lg:right-[6%]
            ${COLUMN_WIDTH_CLASSES}
            top-[calc(22%+26px)]
            bottom-[calc(36%-26px)]
          `}
        >
          <FeatureConnectorGroup
            side="right"
            branchRefs={rightBranchRefs}
          />
        </div>

      </div>


      {/* =====================================
          TITLE
      ===================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-[10%]
          left-1/2
          z-20
          -translate-x-1/2
          text-center
        "
      >

        <h2
          ref={titleRef}
          className="
            whitespace-nowrap
            text-[48px]
            font-medium
            leading-none
            tracking-[-0.055em]

            sm:text-[58px]
            md:text-[70px]
            lg:text-[76px]
          "
        >
          Meet SHIRU
        </h2>

        <p
          ref={subtitleRef}
          className="
            mt-4
            font-mono
            text-[8px]
            uppercase
            tracking-[0.35em]
            text-white/35
          "
        >
          Your AI Buyer
        </p>

      </div>


      {/* =====================================
          SCROLL INDICATOR
      ===================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-4
          left-1/2
          z-20
          -translate-x-1/2
          font-mono
          text-[7px]
          uppercase
          tracking-[0.4em]
          text-white/20
        "
      >
        Scroll
      </div>

    </section>
  )
}

export default ShiruFeatures