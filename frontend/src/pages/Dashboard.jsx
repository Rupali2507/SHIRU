import React from 'react'
import { Link } from 'react-router-dom'

const stats = [
  {
    label: 'Revenue influenced',
    value: '₹1.24L',
    change: '+18.4%',
  },
  {
    label: 'AI-assisted orders',
    value: '38',
    change: '+12 today',
  },
  {
    label: 'Conversion rate',
    value: '8.7%',
    change: '+2.1%',
  },
  {
    label: 'Average order',
    value: '₹2,840',
    change: '+₹320',
  },
]

const activity = [
  {
    time: '2 min ago',
    title: 'AI buyer completed checkout',
    detail: 'Nike Air Max · ₹8,499',
    status: 'Approved',
  },
  {
    time: '8 min ago',
    title: 'SHIRU compared 12 products',
    detail: 'Running shoes · ₹4,000–₹10,000',
    status: 'Completed',
  },
  {
    time: '16 min ago',
    title: 'AI buyer added product to cart',
    detail: 'Apple AirPods Pro · ₹24,900',
    status: 'Awaiting approval',
  },
  {
    time: '24 min ago',
    title: 'Upsell recommendation accepted',
    detail: 'Extended warranty · ₹1,299',
    status: 'Approved',
  },
]

const Dashboard = () => {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* =====================================================
          TOP NAV
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-black/85 backdrop-blur-xl">

        <div className="flex h-[72px] items-center justify-between px-6 lg:px-10">

          {/* Logo */}

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <span className="text-[17px] font-medium tracking-[-0.04em]">
              SHIRU
            </span>

            <span className="text-xs text-white/50">
              ✦
            </span>
          </Link>


          {/* Navigation */}

          <nav className="hidden items-center gap-2 md:flex">

            <Link
              to="/dashboard"
              className="
                rounded-full
                bg-white/[0.10]
                px-5
                py-2
                text-[11px]
                text-white
              "
            >
              Overview
            </Link>

            <Link
              to="/dashboard/agent"
              className="
                rounded-full
                px-5
                py-2
                text-[11px]
                text-white/40
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              Agent
            </Link>

            <Link
              to="/dashboard/catalog"
              className="
                rounded-full
                px-5
                py-2
                text-[11px]
                text-white/40
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              Catalog
            </Link>

            <Link
              to="/dashboard/orders"
              className="
                rounded-full
                px-5
                py-2
                text-[11px]
                text-white/40
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              Orders
            </Link>

            <Link
              to="/dashboard/audit"
              className="
                rounded-full
                px-5
                py-2
                text-[11px]
                text-white/40
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              Audit
            </Link>

          </nav>


          {/* User */}

          <button
            className="
              flex
              items-center
              gap-3
              rounded-full
              border
              border-white/10
              bg-white/[0.04]
              px-4
              py-2
              text-[11px]
              text-white/70
            "
          >
            Rupali Jha

            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] text-black">
              R
            </span>
          </button>

        </div>

      </header>


      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-6 pb-16 pt-[120px] lg:px-10">

        {/* Header */}

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>

            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
              Merchant control
            </p>

            <h1 className="mt-3 text-[42px] font-medium tracking-[-0.055em] md:text-[52px]">
              Your AI commerce engine.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
              SHIRU helps AI buyers discover your products,
              make decisions and complete purchases.
            </p>

          </div>


          {/* Test mode */}

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
                Test mode
              </span>

            </div>

            <button
              className="
                rounded-full
                bg-white
                px-5
                py-2.5
                text-[11px]
                font-medium
                text-black
                transition
                hover:bg-white/90
              "
            >
              View live demo →
            </button>

          </div>

        </div>


        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat) => (
            <div
              key={stat.label}
              className="
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#111111]
                p-6
                transition
                hover:border-white/[0.15]
              "
            >

              <p className="text-[11px] text-white/35">
                {stat.label}
              </p>

              <div className="mt-6 flex items-end justify-between">

                <p className="text-[30px] font-medium tracking-[-0.04em]">
                  {stat.value}
                </p>

                <span className="font-mono text-[9px] text-emerald-400/70">
                  {stat.change}
                </span>

              </div>

            </div>
          ))}

        </div>


        {/* =====================================================
            MAIN CARDS
        ===================================================== */}

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">


          {/* AI AGENT */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#111111]
              p-7
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                  AI agent
                </p>

                <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em]">
                  SHIRU
                </h2>

              </div>


              <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-emerald-400/80">
                  Live
                </span>

              </div>

            </div>


            <p className="mt-6 max-w-md text-sm leading-6 text-white/40">
              Your products are available to AI buyers.
              SHIRU can understand intent, compare products,
              recommend options and initiate checkout.
            </p>


            <div className="mt-8 grid grid-cols-3 gap-3">

              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                <p className="text-xl font-medium">12</p>
                <p className="mt-1 text-[9px] text-white/30">
                  Active buyers
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                <p className="text-xl font-medium">28</p>
                <p className="mt-1 text-[9px] text-white/30">
                  Actions today
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                <p className="text-xl font-medium">94%</p>
                <p className="mt-1 text-[9px] text-white/30">
                  Success
                </p>
              </div>

            </div>


            <button
              className="
                mt-6
                rounded-full
                border
                border-white/10
                px-5
                py-2.5
                text-[10px]
                text-white/60
                transition
                hover:border-white/20
                hover:text-white
              "
            >
              Configure agent →
            </button>

          </div>


          {/* CATALOG */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#111111]
              p-7
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Agent-readable catalog
                </p>

                <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em]">
                  Ready for AI buyers.
                </h2>

              </div>

              <span className="text-2xl text-white/10">
                ✦
              </span>

            </div>


            <div className="mt-8">

              <div className="flex items-end justify-between">

                <div>
                  <p className="text-4xl font-medium tracking-[-0.05em]">
                    96%
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    catalog readiness
                  </p>
                </div>

                <p className="text-[10px] text-white/30">
                  184 products
                </p>

              </div>


              {/* Progress */}

              <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/[0.07]">

                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: '96%' }}
                />

              </div>


              <div className="mt-6 grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">

                  <p className="text-lg font-medium">
                    177
                  </p>

                  <p className="mt-1 text-[9px] text-white/30">
                    AI-ready products
                  </p>

                </div>


                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">

                  <p className="text-lg font-medium">
                    7
                  </p>

                  <p className="mt-1 text-[9px] text-white/30">
                    Need attention
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            ACTIVITY + SAFETY
        ===================================================== */}

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.5fr_1fr]">


          {/* ACTIVITY */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#111111]
            "
          >

            <div className="flex items-center justify-between border-b border-white/[0.06] px-7 py-5">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Live activity
                </p>

                <h2 className="mt-2 text-lg font-medium">
                  What SHIRU is doing
                </h2>

              </div>

              <span className="flex items-center gap-2 text-[9px] text-white/30">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                Live

              </span>

            </div>


            <div>

              {activity.map((item, index) => (
                <div
                  key={item.time}
                  className={`
                    flex
                    items-center
                    justify-between
                    gap-5
                    px-7
                    py-5
                    ${
                      index !== activity.length - 1
                        ? 'border-b border-white/[0.05]'
                        : ''
                    }
                  `}
                >

                  <div className="flex items-start gap-4">

                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] text-white/40">
                      ✦
                    </div>

                    <div>

                      <p className="text-[12px] text-white/80">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[10px] text-white/30">
                        {item.detail}
                      </p>

                    </div>

                  </div>


                  <div className="shrink-0 text-right">

                    <p className="text-[9px] text-white/25">
                      {item.time}
                    </p>

                    <p className="mt-1 text-[9px] text-white/50">
                      {item.status}
                    </p>

                  </div>

                </div>
              ))}

            </div>

          </div>


          {/* BOUNDED ACTIONS */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#111111]
              p-7
            "
          >

            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
              Commerce safety
            </p>

            <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em]">
              Every action is bounded.
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/35">
              SHIRU never spends without permission.
              Every money action is explainable and recorded.
            </p>


            <div className="mt-8 space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-[11px] text-white/50">
                  User approval
                </span>

                <span className="text-[10px] text-emerald-400/70">
                  Required
                </span>

              </div>

              <div className="h-px bg-white/[0.06]" />

              <div className="flex items-center justify-between">

                <span className="text-[11px] text-white/50">
                  Spending limit
                </span>

                <span className="text-[10px] text-white/60">
                  ₹10,000
                </span>

              </div>

              <div className="h-px bg-white/[0.06]" />

              <div className="flex items-center justify-between">

                <span className="text-[11px] text-white/50">
                  Audit logging
                </span>

                <span className="text-[10px] text-emerald-400/70">
                  Enabled
                </span>

              </div>

              <div className="h-px bg-white/[0.06]" />

              <div className="flex items-center justify-between">

                <span className="text-[11px] text-white/50">
                  Payment environment
                </span>

                <span className="text-[10px] text-amber-400/70">
                  Test mode
                </span>

              </div>

            </div>


            <button
              className="
                mt-8
                w-full
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                py-3
                text-[10px]
                text-white/60
                transition
                hover:border-white/20
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              View audit trail →
            </button>

          </div>

        </div>

      </div>

    </main>
  )
}

export default Dashboard