import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const SignIn = () => {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  // -------------------------
  // Handle input
  // -------------------------

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })

  }


  // -------------------------
  // Login
  // -------------------------

  const handleLogin = async (e) => {

    e.preventDefault()

    setError('')

    if (!formData.email || !formData.password) {

      setError('Please enter email and password')

      return
    }


    try {

      setLoading(true)


      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(formData)
        }
      )


      const data = await response.json()


      if (!response.ok) {

        setError(data.message || 'Login failed')

        return
      }


      // -------------------------
      // Store authentication
      // -------------------------

      localStorage.setItem(
        'token',
        data.token
      )

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      )


      // -------------------------
      // Role based redirect
      // -------------------------

      if (data.user.role === 'MERCHANT') {

        navigate('/merchant')

      } else {

        navigate('/app')

      }


    } catch (error) {

      console.error(error)

      setError('Unable to connect to server')

    } finally {

      setLoading(false)

    }

  }


  return (

    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      <Navbar />


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

          <form
            onSubmit={handleLogin}
            className="px-9 pb-8 pt-9"
          >

            {/* Sparkle */}

            <div className="mb-5 text-center text-lg text-white/70">
              ✦
            </div>


            {/* Heading */}

            <h1 className="text-center text-[19px] font-medium">
              Welcome back
            </h1>

            <p className="mt-2 text-center text-[12px] text-white/40">
              Sign in to continue with SHIRU
            </p>


            {/* Google */}

            <button
              type="button"
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
                hover:border-white/20
                hover:bg-white/[0.05]
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
                className="mb-2 block text-[11px] text-white/70"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                  placeholder:text-white/25
                  focus:border-white/30
                "
              />

            </div>


            {/* Password */}

            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="text-[11px] text-white/70"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-[10px] text-white/35 transition hover:text-white"
                >
                  Forgot password?
                </Link>

              </div>


              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
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
                  placeholder:text-white/25
                  focus:border-white/30
                "
              />

            </div>


            {/* Error */}

            {error && (

              <p className="mt-4 text-center text-[11px] text-red-400">
                {error}
              </p>

            )}


            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
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
                hover:scale-[1.01]
                hover:bg-white/90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {loading ? 'Signing in...' : 'Continue'}

              {!loading && (
                <span className="ml-2 text-black/50">
                  →
                </span>
              )}

            </button>

          </form>


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
                className="font-medium text-white hover:text-white/70"
              >
                Create an account
              </Link>

            </p>

          </div>

        </div>

      </section>


      <div
        className="
          absolute
          bottom-7
          left-1/2
          -translate-x-1/2
          font-mono
          text-[8px]
          uppercase
          tracking-[0.35em]
          text-white/20
        "
      >
        SHIRU · AI COMMERCE LAYER
      </div>

    </main>
  )
}

export default SignIn