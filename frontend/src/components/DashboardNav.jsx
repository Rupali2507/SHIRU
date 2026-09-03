import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const DashboardNav = ({ tabs = [], activeTab, onTabChange, eyebrow }) => {

  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?'

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

        {/* User */}

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] text-white/70">

            {user?.name || 'Account'}

            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] text-black">
              {initial}
            </span>

          </div>

          <button
            onClick={handleLogout}
            className="
              rounded-full
              border
              border-white/10
              px-4
              py-2
              text-[11px]
              text-white/50
              transition
              hover:border-white/25
              hover:text-white
            "
          >
            Log out
          </button>

        </div>

      </div>

    </header>
  )
}

export default DashboardNav
