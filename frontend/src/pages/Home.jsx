import React, { useRef } from 'react'
import Navbar from '../components/Navbar'
import ShiruParticles from '../components/ShiruPaticles.jsx'
import { Link } from 'react-router-dom'
import ShiruFeatures from '../components/ShiruFeatures'
import ShiruHowItWorks from '../components/ShiruHowItWorks'
import Footer from '../components/Footer.jsx'

const Home = () => {
  const particleGather = useRef(0)
  const particleMove = useRef(0)

  return (
    <main className="relative w-full overflow-x-hidden bg-black text-white">

     

      <Navbar />

        <ShiruParticles
        gatherRef={particleGather}
        moveRef={particleMove}
        />

      <section
        className="
          relative
          flex
          min-h-screen
          items-center
          justify-center
          overflow-hidden
          px-6
        "
      >

        {/* Dark atmosphere */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025),transparent_55%)]
          "
        />


        <div
          className="
            relative
            z-10
            flex
            max-w-5xl
            flex-col
            items-center
            text-center
          "
        >

          {/* Eyebrow */}

          <div
            className="
              mb-7
              font-mono
              text-[9px]
              uppercase
              tracking-[0.32em]
              text-white/55
              sm:text-[10px]
            "
          >
            AI-POWERED PERSONAL BUYER
          </div>


          {/* Heading */}

          <h1
            className="
              max-w-5xl
              text-[52px]
              font-medium
              leading-[0.98]
              tracking-[-0.055em]
              text-white

              sm:text-[68px]
              md:text-[82px]
              lg:text-[92px]
            "
          >
            Want to buy something
            <br className="hidden sm:block" />
            {' '}but confused?
          </h1>


          {/* Description */}

          <p
            className="
              mt-7
              max-w-2xl
              text-sm
              leading-7
              text-white/45

              sm:text-base
            "
          >
            Tell SHIRU what you want.
            <br className="hidden sm:block" />
            It searches, compares, reasons and helps you buy.
          </p>


          {/* Buttons */}

          <div
            className="
              mt-9
              flex
              flex-col
              items-center
              gap-3

              sm:flex-row
            "
          >

            <Link to='/signup'
              className="
                rounded-full
                bg-white
                px-7
                py-3.5
                text-sm
                font-medium
                text-black
                transition-all
                duration-300
                hover:scale-[1.03]
                hover:bg-white/90
              "
            >
              Start shopping with SHIRU
            </Link>


            <button
              className="
                rounded-full
                border
                border-white/20
                bg-black/20
                px-7
                py-3.5
                text-sm
                font-medium
                text-white/70
                backdrop-blur-sm
                transition-all
                duration-300
                hover:border-white/40
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              Watch demo
            </button>

          </div>

        </div>


        {/* Scroll */}

        <div
          className="
            absolute
            bottom-7
            left-1/2
            z-20
            -translate-x-1/2
            font-mono
            text-[8px]
            uppercase
            tracking-[0.4em]
            text-white/25
          "
        >
          Scroll
        </div>

      </section>


      <ShiruFeatures particleGather={particleGather}/>

      <ShiruHowItWorks particleMove={particleMove}/>
<Footer/>

    </main>
  )
}

export default Home