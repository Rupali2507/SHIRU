import React from 'react'

const ORDER_STATUS_STYLES = {
  PAID: 'text-emerald-400/80',
  PROCESSING: 'text-amber-400/80',
  SHIPPED: 'text-blue-400/80',
  DELIVERED: 'text-emerald-400/80',
  CANCELLED: 'text-red-400/80',
}

const MerchantOverview = ({
  stats,
  orders,
  onManageCatalog,
  onViewOrders,
}) => {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">

      {/* AI catalog */}

      <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-7">

        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
          Agent-readable catalog
        </p>

        <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em]">
          Ready for AI buyers.
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3">

          <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
            <p className="text-lg font-medium">
              {stats.activeProducts}
            </p>

            <p className="mt-1 text-[9px] text-white/30">
              AI-ready products
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
            <p className="text-lg font-medium">
              {stats.totalProducts - stats.activeProducts}
            </p>

            <p className="mt-1 text-[9px] text-white/30">
              Need attention
            </p>
          </div>

        </div>

        <button
          onClick={onManageCatalog}
          className="mt-6 rounded-full border border-white/10 px-5 py-2.5 text-[10px] text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Manage catalog →
        </button>

      </div>


      {/* Recent orders */}

      <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-7">

        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
          Recent orders
        </p>

        <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em]">
          What's coming in.
        </h2>

        {orders.length === 0 ? (

          <p className="mt-8 text-[12px] text-white/35">
            No orders yet.
          </p>

        ) : (

          <div className="mt-6 space-y-3">

            {orders.slice(0, 3).map((order) => (

              <div
                key={order._id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3"
              >

                <p className="text-[11px] text-white/70">
                  {order.items?.[0]?.name}

                  {order.items?.length > 1
                    ? ` +${order.items.length - 1}`
                    : ''}
                </p>

                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.2em] ${
                    ORDER_STATUS_STYLES[order.status] ||
                    'text-white/40'
                  }`}
                >
                  {order.status}
                </span>

              </div>

            ))}

          </div>

        )}

        <button
          onClick={onViewOrders}
          className="mt-6 rounded-full border border-white/10 px-5 py-2.5 text-[10px] text-white/60 transition hover:border-white/20 hover:text-white"
        >
          View all orders →
        </button>

      </div>

    </div>
  )
}

export default MerchantOverview