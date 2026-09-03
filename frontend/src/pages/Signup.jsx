import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Signup = () => {

  const navigate = useNavigate()

  const [role, setRole] = useState('USER')

  const [formData, setFormData] = useState({
  name: '',
  email: '',
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




  const handleSignup = async (e) => {

    e.preventDefault()

    setError('')
    setSuccess('')

    if (
  !formData.name ||
  !formData.email ||
  !formData.password ||
  !formData.confirmPassword
) {
  setError('Please fill all fields')
  return
}

if (formData.password !== formData.confirmPassword) {
  setError('Passwords do not match')
  return
}

    try {

      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/auth/signup',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role
          })
        }
      )


      const data = await response.json()


      if (!response.ok) {

        setError(data.message || 'Signup failed')

        return
      }


      setSuccess('Account created successfully!')

      // Send user to login

      setTimeout(() => {
        navigate('/signin')
      }, 1000)


    } catch (error) {

      console.error(error)

      setError('Unable to connect to server')

    } finally {

      setLoading(false)

    }

  }


  return (

    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035),transparent_55%)]" />

      <Navbar />


<section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24">
        <div
          className="
            w-full
            max-w-[420px]
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
            onSubmit={handleSignup}
            className="px-9 pb-8 pt-9"
          >

            {/* Sparkle */}

            <div className="mb-5 text-center text-lg text-white/70">
              ✦
            </div>


            {/* Heading */}

            <h1 className="text-center text-[19px] font-medium">
              Welcome to SHIRU
            </h1>

            <p className="mt-2 text-center text-[12px] text-white/40">
              Choose how you want to use SHIRU.
            </p>


            {/* Role */}

            <div className="mt-7">

              <p className="mb-3 text-[11px] font-medium text-white/60">
                I want to use SHIRU as
              </p>


              <div className="grid grid-cols-2 gap-3">


                {/* USER */}

                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`
                    rounded-xl
                    border
                    p-4
                    text-left
                    transition-all
                    ${
                      role === 'USER'
                        ? 'border-white/30 bg-white/[0.08]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                    }
                  `}
                >

                  <div className="mb-3 text-lg">
                    👤
                  </div>

                  <p className="text-[12px] font-medium">
                    Customer
                  </p>

                  <p className="mt-1 text-[10px] text-white/40">
                    Use SHIRU as your AI buyer
                  </p>

                  {role === 'USER' && (
                    <div className="mt-3 text-[9px] uppercase tracking-wider text-white/60">
                      Selected
                    </div>
                  )}

                </button>


                {/* MERCHANT */}

                <button
                  type="button"
                  onClick={() => setRole('MERCHANT')}
                  className={`
                    rounded-xl
                    border
                    p-4
                    text-left
                    transition-all
                    ${
                      role === 'MERCHANT'
                        ? 'border-white/30 bg-white/[0.08]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                    }
                  `}
                >

                  <div className="mb-3 text-lg">
                    🏪
                  </div>

                  <p className="text-[12px] font-medium">
                    Merchant
                  </p>

                  <p className="mt-1 text-[10px] text-white/40">
                    Make your store AI-transactable
                  </p>

                  {role === 'MERCHANT' && (
                    <div className="mt-3 text-[9px] uppercase tracking-wider text-white/60">
                      Selected
                    </div>
                  )}

                </button>

              </div>

            </div>


            {/* Name */}

            <div className="mt-6">

              <label
                htmlFor="name"
                className="mb-2 block text-[11px] text-white/70"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
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


            {/* Email */}

            <div className="mt-5">

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

              <label
                htmlFor="password"
                className="mb-2 block text-[11px] text-white/70"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
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
            {/* Confirm Password */}

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
    placeholder="Confirm your password"
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


            {/* Success */}

            {success && (

              <p className="mt-4 text-center text-[11px] text-green-400">
                {success}
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

              {loading ? 'Creating account...' : 'Create account'}

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

              Already have an account?{' '}

              <Link
                to="/signin"
                className="font-medium text-white hover:text-white/70"
              >
                Sign in
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

export default Signup