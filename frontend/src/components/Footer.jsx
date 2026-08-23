import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-8">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tracking-[-0.03em]">
            SHIRU
          </span>

          <span className="text-xs text-white/40">
            ✦
          </span>
        </div>

        {/* Copyright */}
        <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/25">
          © 2026 SHIRU
        </p>

      </div>
    </footer>
  )
}

export default Footer