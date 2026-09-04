import React from 'react'

const MerchantStats = ({ stats }) => {
  return (
    <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

      <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
        <p className="text-[11px] text-white/35">
          Total products
        </p>

        <p className="mt-4 text-[26px] font-medium tracking-[-0.04em]">
          {stats.totalProducts}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
        <p className="text-[11px] text-white/35">
          Active products
        </p>

        <p className="mt-4 text-[26px] font-medium tracking-[-0.04em]">
          {stats.activeProducts}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
        <p className="text-[11px] text-white/35">
          Orders
        </p>

        <p className="mt-4 text-[26px] font-medium tracking-[-0.04em]">
          {stats.totalOrders}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
        <p className="text-[11px] text-white/35">
          Revenue
        </p>

        <p className="mt-4 text-[26px] font-medium tracking-[-0.04em]">
          ₹{stats.revenue.toLocaleString('en-IN')}
        </p>
      </div>

    </div>
  )
}

export default MerchantStats