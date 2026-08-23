import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ShiruParticles from './ShiruPaticles.jsx'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: '01',
    title: 'Tell SHIRU what you want',
    description:
      "Describe what you're looking for naturally. No forms, filters or endless searching. SHIRU understands your intent.",
  },
  {
    number: '02',
    title: 'SHIRU shops & compares',
    description:
      'SHIRU searches available merchants and compares price, ratings, delivery, returns and offers to find the right options.',
  },
  {
    number: '03',
    title: 'You approve. SHIRU buys.',
    description:
      'SHIRU explains why it recommends an option. Nothing is purchased until you approve the action.',
  },
]

const ShiruHowItWorks = () => {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const labelRef = useRef(null)
  const stepRefs = useRef([])
  const particleAreaRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const stepElements = stepRefs.current

      // ------------------------------------
      // INITIAL STATE
      // ------------------------------------

      gsap.set(labelRef.current, {
        opacity: 0,
        y: 20,
      })

      gsap.set(headingRef.current, {
        opacity: 0,
        y: 45,
      })

      gsap.set(stepElements, {
        opacity: 0,
        y: 35,
      })

      gsap.set(particleAreaRef.current, {
        opacity: 0,
        scale: 0.8,
      })

      // ------------------------------------
      // SCROLL ANIMATION
      // ------------------------------------

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,

          start: 'top 75%',
          end: 'top 15%',

          scrub: 1,

          invalidateOnRefresh: true,
        },
      })

      // Label

      tl.to(labelRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.15,
        ease: 'power2.out',
      })

      // Heading

      tl.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'back.out(1.2)',
      })

      // Steps

      tl.to(stepElements, {
        opacity: 1,
        y: 0,
        duration: 0.2,
        stagger: 0.15,
        ease: 'power2.out',
      })

      // Particle destination

      tl.to(particleAreaRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: 'back.out(1.4)',
      })
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
        min-h-screen
        w-full
        overflow-hidden
        bg-black
        text-white
      "
    >

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          min-h-screen
          w-full
          max-w-[1500px]
          px-8
          md:px-16
          lg:px-24
        "
      >

        {/* =================================
            LEFT CONTENT
        ================================= */}

        <div className="
          w-full
          pt-[15vh]
          lg:w-[58%]
        ">

          {/* LABEL */}

          <p
            ref={labelRef}
            className="
              font-mono
              text-[9px]
              uppercase
              tracking-[0.35em]
              text-white/30
            "
          >
            • &nbsp; How SHIRU works
          </p>


          {/* HEADING */}

          <h2
            ref={headingRef}
            className="
              mt-7
              max-w-[600px]
              text-[48px]
              font-medium
              leading-[0.96]
              tracking-[-0.055em]

              md:text-[62px]

              lg:text-[70px]
            "
          >
            From “I want this.”
            <br />
            to “It’s on the way.”
          </h2>


          {/* =================================
              STEPS
          ================================= */}

          <div
            className="
              mt-14
              max-w-[620px]
            "
          >

            {steps.map((step, index) => (
              <div
                key={step.number}
                ref={(element) => {
                  stepRefs.current[index] = element
                }}
                className="
                  how-step
                  border-t
                  border-white/[0.10]
                  py-7
                "
              >

                <div className="flex gap-6">

                  {/* NUMBER */}

                  <span
                    className="
                      shrink-0
                      pt-1
                      font-mono
                      text-[10px]
                      text-white/25
                    "
                  >
                    {step.number}
                  </span>


                  {/* CONTENT */}

                  <div>

                    <h3
                      className="
                        text-[15px]
                        font-medium
                        tracking-tight
                        text-white
                        md:text-[16px]
                      "
                    >
                      {step.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        max-w-[500px]
                        text-[11px]
                        leading-[1.7]
                        text-white/40
                        md:text-[12px]
                      "
                    >
                      {step.description}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>


        {/* =====================================
            PARTICLE DESTINATION
        ===================================== */}

        <div
            ref={particleAreaRef}
            className="
                pointer-events-none
                absolute
                right-[5%]
                top-[24%]
                z-0

                h-[420px]
                w-[420px]

                md:right-[7%]
                md:h-[460px]
                md:w-[460px]

                lg:right-[8%]
                lg:top-[23%]
                lg:h-[500px]
                lg:w-[500px]
            "
            >
            <ShiruParticles />

            {/* subtle atmosphere */}

            <div
                className="
                pointer-events-none
                absolute
                inset-[20%]
                -z-10
                rounded-full
                bg-white/[0.025]
                blur-[80px]
                "
            />
            </div>

      </div>

    </section>
  )
}

export default ShiruHowItWorks