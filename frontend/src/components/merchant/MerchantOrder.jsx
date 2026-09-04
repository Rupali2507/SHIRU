import React from 'react'

const NEXT_STATUS = {
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const ORDER_STATUS_STYLES = {
  PAID: 'text-emerald-400/80',
  PROCESSING: 'text-amber-400/80',
  SHIPPED: 'text-blue-400/80',
  DELIVERED: 'text-emerald-400/80',
  CANCELLED: 'text-red-400/80',
}

const MerchantOrders = ({
  orders,
  loading,
  error,
  onStatusChange,
}) => {
  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111]">

      {loading && (
        <p className="px-7 py-10 text-center text-[12px] text-white/30">
          Loading orders...
        </p>
      )}

      {!loading && error && (
        <p className="px-7 py-10 text-center text-[12px] text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className="px-7 py-10 text-center text-[12px] text-white/30">
          No orders yet.
        </p>
      )}

      {!loading &&
        !error &&
        orders.map((order, index) => {

          const nextOptions =
            NEXT_STATUS[order.status] || []

          return (

            <div
              key={order._id}
              className={`
                flex flex-col gap-3 px-7 py-5
                sm:flex-row sm:items-center sm:justify-between
                ${
                  index !== orders.length - 1
                    ? 'border-b border-white/[0.05]'
                    : ''
                }
              `}
            >

              <div>

                <p className="text-[12px] text-white/80">
                  {order.items
                    ?.map((item) => item.name)
                    .join(', ')}
                </p>

                <p className="mt-1 text-[10px] text-white/30">
                  {order.user?.name || 'Customer'} ·{' '}
                  {new Date(order.createdAt).toLocaleDateString(
                    'en-IN',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }
                  )}
                </p>

              </div>


              <div className="flex shrink-0 items-center gap-5">

                <p className="text-[12px] text-white/60">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </p>

                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.2em] ${
                    ORDER_STATUS_STYLES[order.status] ||
                    'text-white/40'
                  }`}
                >
                  {order.status}
                </span>

                {nextOptions.length > 0 && (

                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        onStatusChange(
                          order._id,
                          e.target.value
                        )
                      }
                    }}
                    defaultValue=""
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[10px] text-white outline-none"
                  >

                    <option value="" disabled>
                      Update status
                    </option>

                    {nextOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-black"
                      >
                        {status}
                      </option>
                    ))}

                  </select>

                )}

              </div>

            </div>

          )
        })}

    </div>
  )
}

export default MerchantOrders