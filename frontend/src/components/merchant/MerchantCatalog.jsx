import React from 'react'

const MerchantCatalog = ({
  products,
  loading,
  error,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  return (
    <div className="mt-10">

      {/* Header */}

      <div className="flex items-center justify-between">

        <h2 className="text-lg font-medium">
          Your products
        </h2>

        <button
          onClick={onAddProduct}
          className="rounded-full bg-white px-5 py-2.5 text-[11px] font-medium text-black transition hover:bg-white/90"
        >
          + Add product
        </button>

      </div>


      {/* Products */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111]">

        {loading && (
          <p className="px-7 py-10 text-center text-[12px] text-white/30">
            Loading products...
          </p>
        )}

        {!loading && error && (
          <p className="px-7 py-10 text-center text-[12px] text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="px-7 py-10 text-center text-[12px] text-white/30">
            No products yet. Add your first one.
          </p>
        )}

        {!loading &&
          !error &&
          products.map((product, index) => (

            <div
              key={product._id}
              className={`
                flex flex-col gap-3 px-7 py-5
                sm:flex-row sm:items-center sm:justify-between
                ${
                  index !== products.length - 1
                    ? 'border-b border-white/[0.05]'
                    : ''
                }
              `}
            >

              <div className="flex items-center gap-4">

                {/* Product image */}

                {product.images?.[0] ? (

                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-12 w-12 rounded-xl object-cover"
                  />

                ) : (

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/20">
                    ✦
                  </div>

                )}

                <div>

                  <p className="text-[13px] text-white/85">
                    {product.name}
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    {product.category} · SKU {product.sku} · Stock {product.stock}
                  </p>

                </div>

              </div>


              <div className="flex shrink-0 items-center gap-5">

                <p className="text-[12px] text-white/60">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </p>

                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.2em] ${
                    product.status === 'ACTIVE'
                      ? 'text-emerald-400/80'
                      : 'text-white/30'
                  }`}
                >
                  {product.status}
                </span>

                <button
                  onClick={() => onEditProduct(product)}
                  className="text-[10px] text-white/50 hover:text-white"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDeleteProduct(product._id)}
                  className="text-[10px] text-white/50 hover:text-red-400"
                >
                  Remove
                </button>

              </div>

            </div>

          ))}

      </div>

    </div>
  )
}

export default MerchantCatalog