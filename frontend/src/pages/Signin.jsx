import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
// import ParticleBackground from '../components/ParticleBackground'

const SignIn = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Your particle background */}
      {/* <ParticleBackground /> */}

      {/* Dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      {/* Navbar */}
      <Navbar />

      {/* Sign In */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">

        <div
          className="
            w-full
            max-w-[390px]
            overflow-hidden
            rounded-[22px]
            border
            border-white/[0.08]
            bg-[#0b0b0b]/95
            shadow-2xl
            backdrop-blur-xl
          "
        >

          {/* Main form */}
          <div className="px-9 pb-8 pt-9">

            {/* Sparkle */}
            <div className="mb-5 text-center text-lg text-white/70">
              ✦
            </div>

            {/* Heading */}
            <h1 className="text-center text-[19px] font-medium tracking-[-0.02em]">
              Welcome back
            </h1>

            <p className="mt-2 text-center text-[12px] text-white/40">
              Sign in to continue shopping with SHIRU
            </p>


            {/* Google */}
            <button
              className="
                mt-7
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-lg
                border
                border-white/10
                bg-white/[0.02]
                px-4
                py-3
                text-[12px]
                text-white/70
                transition
                hover:border-white/20
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              <span className="text-base font-semibold">
                G
              </span>

              Continue with Google
            </button>


            {/* Divider */}
            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/[0.08]" />

              <span className="text-[10px] text-white/30">
                OR
              </span>

              <div className="h-px flex-1 bg-white/[0.08]" />

            </div>


            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-medium text-white/70"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="
                  w-full
                  rounded-lg
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-4
                  py-3
                  text-[12px]
                  text-white
                  outline-none
                  transition
                  placeholder:text-white/25
                  focus:border-white/30
                  focus:bg-white/[0.06]
                "
              />
            </div>


            {/* Password */}
            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="text-[11px] font-medium text-white/70"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-[10px] text-white/35 transition hover:text-white"
                >
                  Forgot password?
                </button>

              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="
                  w-full
                  rounded-lg
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-4
                  py-3
                  text-[12px]
                  text-white
                  outline-none
                  transition
                  placeholder:text-white/25
                  focus:border-white/30
                  focus:bg-white/[0.06]
                "
              />

            </div>


            {/* Continue */}
            <button
              className="
                mt-7
                w-full
                rounded-lg
                bg-white
                px-4
                py-3
                text-[12px]
                font-medium
                text-black
                transition-all
                duration-300
                hover:scale-[1.01]
                hover:bg-white/90
              "
            >
              Continue
              <span className="ml-2 text-black/50">→</span>
            </button>

          </div>


          {/* Bottom */}
          <div
            className="
              border-t
              border-white/[0.07]
              bg-white/[0.015]
              px-8
              py-5
              text-center
            "
          >
            <p className="text-[11px] text-white/40">
              New to SHIRU?{' '}

              <Link
                to="/signup"
                className="font-medium text-white transition hover:text-white/70"
              >
                Create an account
              </Link>
            </p>
          </div>

        </div>

      </section>


      {/* Bottom branding */}
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
          tracking-[0.35em]
          text-white/20
        "
      >
        SHIRU · YOUR AI BUYER
      </div>

    </main>
  )
}

export default SignIn