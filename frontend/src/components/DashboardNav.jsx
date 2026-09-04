import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const DashboardNav = ({ tabs = [], activeTab, onTabChange, eyebrow, showCart = false, cartCount = 0, onCartClick }) => {

  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?'

  const [profileOpen, setProfileOpen] = useState(false)

  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/signin')
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-black/85 backdrop-blur-xl">

      <div className="flex h-[72px] items-center justify-between px-6 lg:px-10">

        {/* Logo */}

        <Link to="/" className="flex items-center gap-2">
          <span className="text-[17px] font-medium tracking-[-0.04em]">
            SHIRU
          </span>

          <span className="text-xs text-white/50">
            ✦
          </span>

          {eyebrow && (
            <span className="ml-3 hidden font-mono text-[9px] uppercase tracking-[0.25em] text-white/25 sm:inline">
              {eyebrow}
            </span>
          )}
        </Link>

        {/* Tabs */}

        {tabs.length > 0 && (
          <nav className="hidden items-center gap-2 md:flex">

            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`
                  rounded-full
                  px-5
                  py-2
                  text-[11px]
                  transition
                  ${
                    activeTab === tab.key
                      ? 'bg-white/[0.10] text-white'
                      : 'text-white/40 hover:bg-white/[0.05] hover:text-white'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}

          </nav>
        )}

        {/* Right icons */}

        <div className="flex items-center gap-3">

          {showCart && (
            <button
              onClick={onCartClick}
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                text-white/60
                transition
                hover:border-white/25
                hover:text-white
              "
              aria-label="Cart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="9" cy="21" r="1.4" />
                <circle cx="18" cy="21" r="1.4" />
                <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-medium text-black">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Profile */}

          <div className="relative" ref={profileRef}>

            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/[0.04]
                text-[11px]
                text-white/80
                transition
                hover:border-white/25
              "
              aria-label="Profile"
            >
              {initial}
            </button>

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[calc(100%+10px)]
                  w-52
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-[#0e0e0e]
                  shadow-2xl
                "
              >

                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="text-[12px] text-white/85">{user?.name || 'Account'}</p>
                  <p className="mt-0.5 truncate text-[10px] text-white/35">{user?.email}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2
                    px-4
                    py-3
                    text-left
                    text-[11px]
                    text-white/60
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Log out
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

    </header>
  )
}

export default DashboardNav
