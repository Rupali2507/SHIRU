import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const ForgotPassword = () => {

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {

    e.preventDefault()

    setMessage('')
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    try {

      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/auth/forgot-password',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            email
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Something went wrong')
        return
      }

      setMessage(data.message)

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

        <div className="
          w-full
          max-w-[390px]
          overflow-hidden
          rounded-[22px]
          border
          border-white/[0.08]
          bg-[#0b0b0b]/95
          shadow-2xl
          backdrop-blur-xl
        ">

          <form
            onSubmit={handleSubmit}
            className="px-9 pb-8 pt-9"
          >

            <div className="mb-5 text-center text-lg text-white/70">
              ✦
            </div>

            <h1 className="text-center text-[19px] font-medium">
              Forgot password?
            </h1>

            <p className="mt-2 text-center text-[12px] leading-relaxed text-white/40">
              Enter your email and we'll send you a secure reset link.
            </p>

            <div className="mt-7">

              <label
                htmlFor="email"
                className="mb-2 block text-[11px] text-white/70"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            {error && (
              <p className="mt-4 text-center text-[11px] text-red-400">
                {error}
              </p>
            )}

            {message && (
              <p className="mt-4 text-center text-[11px] leading-relaxed text-green-400">
                {message}
              </p>
            )}

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
              {loading ? 'Sending...' : 'Send reset link'}

              {!loading && (
                <span className="ml-2 text-black/50">
                  →
                </span>
              )}
            </button>

          </form>

          <div className="
            border-t
            border-white/[0.07]
            bg-white/[0.015]
            px-8
            py-5
            text-center
          ">

            <Link
              to="/signin"
              className="text-[11px] font-medium text-white hover:text-white/70"
            >
              ← Back to sign in
            </Link>

          </div>

        </div>

      </section>

    </main>
  )
}

export default ForgotPassword