import React from 'react'
import assets from '../assets/assets'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full ">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between">

        {/* Logo */}
        <a
          href="/"
          className="group flex items-center"
        >
          <img
            src={assets.logo}
            alt="SHIRU"
            className="w-[120px] md:w-[140px]"
          />
        </a>

        {/* Right */}
        <div className="flex items-center gap-5">

          <Link
            to="/signin"
            className="
                rounded-full
                bg-white
                px-6
                py-2.5
                text-[11px]
                font-medium
                text-black
            "
            >
            Sign in
            </Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar