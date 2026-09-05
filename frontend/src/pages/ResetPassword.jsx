import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'

const ResetPassword = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })

  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    setError('')
    setSuccess('')

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill both password fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {

      setLoading(true)

      const response = await fetch(
        `${API_URL}/auth/reset-password/${token}`,
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
        setError(data.message || 'Unable to reset password')
        return
      }

      setSuccess('Password reset successfully.')

      setTimeout(() => {
        navigate('/signin')
      }, 1500)

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
              Create new password
            </h1>

            <p className="mt-2 text-center text-[12px] text-white/40">
              Choose a new password for your SHIRU account.
            </p>

            {/* Password */}

            <div className="mt-7">

              <label
                htmlFor="password"
                className="mb-2 block text-[11px] text-white/70"
              >
                New password
              </label>

              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
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

            {/* Confirm */}

            <div className="mt-5">

              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-[11px] text-white/70"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
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

            {success && (
              <p className="mt-4 text-center text-[11px] text-green-400">
                {success}
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
              {loading ? 'Updating...' : 'Reset password'}

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

export default ResetPassword