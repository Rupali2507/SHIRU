import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import ShiruParticles from '../components/ShiruPaticles.jsx'
import { getProducts, searchProducts } from '../services/productService'
import {
  createOrder,
  openRazorpayCheckout,
  getMyOrders,
} from '../services/orderService'

const TABS = [
  { key: 'shop', label: 'Shop' },
  { key: 'orders', label: 'My orders' },
]

const ORDER_STATUS_STYLES = {
  PENDING: 'text-white/50',
  PAYMENT_PENDING: 'text-amber-400/80',
  PAID: 'text-emerald-400/80',
  PROCESSING: 'text-amber-400/80',
  SHIPPED: 'text-blue-400/80',
  DELIVERED: 'text-emerald-400/80',
  CANCELLED: 'text-red-400/80',
}

const UserDashboard = () => {
 
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // -------------------------
  // Guard route
  // -------------------------

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token || !user || user.role !== 'USER') {
      navigate('/signin')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [activeTab, setActiveTab] = useState('shop')

  // -------------------------
  // Products
  // -------------------------

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')


  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      setProductsError('')

      const data = await getProducts()

      setProducts(data)

    } catch (error) {
      setProductsError(error.message || 'Unable to load products')
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()

    try {
      setProductsLoading(true)
      setProductsError('')

      const data = searchQuery.trim()
        ? await searchProducts({ query: searchQuery.trim() })
        : await getProducts()

      setProducts(data)

    } catch (error) {
      setProductsError(error.message || 'Search failed')
    } finally {
      setProductsLoading(false)
    }
  }
 

  // -------------------------
  // Shiru hero + stores
  // -------------------------

  const particleProgress = useRef(1)
  const recommendedRef = useRef(null)

  const [aiPromptOpen, setAiPromptOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState(null)

  const stores = useMemo(() => {
    const map = new Map()

    products.forEach((product) => {
      const merchantId = product.merchant?._id

      if (!merchantId) return

      if (!map.has(merchantId)) {
        map.set(merchantId, {
          id: merchantId,
          storeName: product.merchant.storeName || 'SHIRU merchant',
          productCount: 0,
        })
      }

      map.get(merchantId).productCount += 1
    })

    return Array.from(map.values())
  }, [products])

  const visibleProducts = useMemo(() => {
    if (!selectedStoreId) return products
    return products.filter((product) => product.merchant?._id === selectedStoreId)
  }, [products, selectedStoreId])

  // -------------------------
  // Buy panel
  // -------------------------

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [shipping, setShipping] = useState({
    name: user?.name || '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  })

  const [buyLoading, setBuyLoading] = useState(false)
  const [buyMessage, setBuyMessage] = useState('')
  const [buyError, setBuyError] = useState('')

  const openBuyPanel = (product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setSelectedSize(product.sizes?.[0] || '')
    setSelectedColor(product.colors?.[0] || '')
    setBuyMessage('')
    setBuyError('')
  }

  const closeBuyPanel = () => {
    setSelectedProduct(null)
  }

  const handleShippingChange = (e) => {
    setShipping({
      ...shipping,
      [e.target.id]: e.target.value,
    })
  }
 
  const handleBuy = async () => {
    if (!shipping.name || !shipping.phone || !shipping.addressLine1 || !shipping.city || !shipping.postalCode) {
      setBuyError('Please fill in your shipping details')
      return
    }

    try {
      setBuyError('')
      setBuyLoading(true)
      setBuyMessage('Creating order...')

      const orderData = await createOrder(
        [
          {
            productId: selectedProduct._id,
            quantity,
            selectedSize: selectedSize || undefined,
            selectedColor: selectedColor || undefined,
          },
        ],
        shipping
      )

      setBuyMessage('Opening Razorpay...')

      const result = await openRazorpayCheckout(orderData, {
        name: shipping.name,
        contact: shipping.phone,
      })

      setBuyMessage(`Payment successful. Order ${result.order.id} confirmed.`)

      loadProducts()

    } catch (error) {
      setBuyError(error.message || 'Something went wrong')
      setBuyMessage('')
    } finally {
      setBuyLoading(false)
    }
  }

  // -------------------------
  // Orders
  // -------------------------

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  const loadOrders = async () => {
    try {
      setOrdersLoading(true)
      setOrdersError('')

      const data = await getMyOrders()

      setOrders(data)

    } catch (error) {
      setOrdersError(error.message || 'Unable to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const [cartNotice, setCartNotice] = useState(false)

  return (
    <main className="min-h-screen bg-black text-white">

      <DashboardNav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        eyebrow="AI buyer"
        showCart
        onCartClick={() => {
          setCartNotice(true)
          setTimeout(() => setCartNotice(false), 2500)
        }}
      />

      {cartNotice && (
        <div className="fixed right-6 top-[84px] z-[70] rounded-full border border-white/10 bg-[#111111] px-4 py-2 text-[11px] text-white/60 shadow-xl">
          Cart is on the way — for now, buy items directly from a product.
        </div>
      )}

      <div className="mx-auto max-w-[1500px] px-6 pb-16 pt-[120px] lg:px-10">

        {/* ============================================= */}
        {/* SHOP TAB */}
        {/* ============================================= */}

        {activeTab === 'shop' && (
          <div className="mt-8 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0a0a0a]">

            {/* Hero — Shiru */}

            <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden border-b border-white/[0.07] px-6 py-16 text-center">

              <ShiruParticles progressRef={particleProgress} />

              <div className="relative z-10">

                <h2 className="text-[32px] font-medium tracking-[-0.04em] md:text-[40px]">
                  Hey! I am SHIRU
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-white/40">
                  Tell me what you're looking for and I'll find the best possible version.
                </p>

                {!aiPromptOpen ? (
                  <button
                    onClick={() => setAiPromptOpen(true)}
                    className="
                      mt-7
                      rounded-full
                      bg-white
                      px-7
                      py-3
                      text-[12px]
                      font-medium
                      text-black
                      transition
                      hover:bg-white/90
                    "
                  >
                    Start shopping
                  </button>
                ) : (
                  <form
                        onSubmit={(e) => {
                          e.preventDefault()

                          const trimmed = searchQuery.trim()

                          // Ask always takes the user to SHIRU's chat page.
                          // If they typed something, SHIRU answers it right away.
                          // If they didn't, SHIRU greets them and starts listening
                          // so they can just talk instead.
                          navigate(
                            trimmed
                              ? `/chat?query=${encodeURIComponent(trimmed)}`
                              : '/chat'
                          )
                        }}
                        className="mx-auto mt-7 flex max-w-md items-center gap-2"
                      >
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. running shoes under ₹3000"
                      className="
                        w-full
                        rounded-full
                        border
                        border-white/15
                        bg-black/60
                        px-5
                        py-3
                        text-[12px]
                        text-white
                        outline-none
                        placeholder:text-white/25
                        focus:border-white/30
                      "
                    />
                    <button
                      type="submit"
                      className="
                        shrink-0
                        rounded-full
                        bg-white
                        px-5
                        py-3
                        text-[11px]
                        font-medium
                        text-black
                        transition
                        hover:bg-white/90
                      "
                    >
                      Ask
                    </button>
                  </form>
                )}

              </div>

            </div>
           

            {/* Stores in Shiru */}

            <div className="border-b border-white/[0.07] px-7 py-8 lg:px-10">

              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-medium">Stores in Shiru</h3>

                {selectedStoreId && (
                  <button
                    onClick={() => setSelectedStoreId(null)}
                    className="text-[10px] text-white/40 hover:text-white"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              {stores.length === 0 ? (
                <p className="mt-4 text-[12px] text-white/30">
                  No stores have listed products yet.
                </p>
              ) : (
                <div className="mt-5 flex gap-3 overflow-x-auto pb-2">

                  {stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStoreId(store.id === selectedStoreId ? null : store.id)}
                      className={`
                        w-[220px]
                        shrink-0
                        rounded-2xl
                        border
                        p-5
                        text-left
                        transition
                        ${
                          selectedStoreId === store.id
                            ? 'border-white/30 bg-white/[0.06]'
                            : 'border-white/[0.08] bg-[#111111] hover:border-white/20'
                        }
                      `}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[12px] text-white/70">
                        {store.storeName.charAt(0).toUpperCase()}
                      </div>

                      <p className="mt-4 text-[13px] font-medium leading-5">
                        {store.storeName}
                      </p>

                      <p className="mt-1 text-[10px] text-white/30">
                        {store.productCount} product{store.productCount === 1 ? '' : 's'}
                      </p>
                    </button>
                  ))}

                </div>
              )}

            </div>

            {/* Recommended products */}

            <div ref={recommendedRef} className="px-7 py-8 lg:px-10">

              <h3 className="text-[15px] font-medium">Recommended products</h3>

              <div className="mt-6">

                {productsLoading && (
                  <p className="py-16 text-center text-[12px] text-white/30">
                    Loading products...
                  </p>
                )}

                {!productsLoading && productsError && (
                  <p className="py-16 text-center text-[12px] text-red-400">
                    {productsError}
                  </p>
                )}

                {!productsLoading && !productsError && visibleProducts.length === 0 && (
                  <p className="py-16 text-center text-[12px] text-white/30">
                    No products found.
                  </p>
                )}

                {!productsLoading && !productsError && visibleProducts.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    {visibleProducts.map((product) => (
                      <div
                        key={product._id}
                        className="
                          group
                          overflow-hidden
                          rounded-2xl
                          border
                          border-white/[0.08]
                          bg-[#111111]
                          transition
                          hover:border-white/[0.18]
                        "
                      >

                        <div className="flex aspect-square items-center justify-center border-b border-white/[0.06] bg-black/40">

                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <span className="text-3xl text-white/10">✦</span>
                          )}

                        </div>

                        <div className="p-5">

                          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
                            {product.category}
                          </p>

                          <h3 className="mt-2 text-[14px] font-medium leading-5">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-[11px] text-white/35">
                            {product.merchant?.storeName || 'SHIRU merchant'}
                          </p>

                          <div className="mt-4 flex items-center justify-between">

                            <p className="text-[15px] font-medium">
                              ₹{product.price.toLocaleString('en-IN')}
                            </p>

                            <button
                              onClick={() => openBuyPanel(product)}
                              className="
                                rounded-full
                                border
                                border-white/15
                                px-4
                                py-1.5
                                text-[10px]
                                text-white/70
                                transition
                                hover:border-white/30
                                hover:bg-white
                                hover:text-black
                              "
                            >
                              Buy
                            </button>

                          </div>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ============================================= */}
        {/* ORDERS TAB */}
        {/* ============================================= */}

        {activeTab === 'orders' && (
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-[#111111]">

            <div className="flex items-center justify-between border-b border-white/[0.06] px-7 py-5">

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Order history
                </p>
                <h2 className="mt-2 text-lg font-medium">
                  Everything you've bought with SHIRU
                </h2>
              </div>

            </div>

            {ordersLoading && (
              <p className="px-7 py-10 text-center text-[12px] text-white/30">
                Loading orders...
              </p>
            )}

            {!ordersLoading && ordersError && (
              <p className="px-7 py-10 text-center text-[12px] text-red-400">
                {ordersError}
              </p>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <p className="px-7 py-10 text-center text-[12px] text-white/30">
                No orders yet. Go buy something SHIRU picked out for you.
              </p>
            )}

            {!ordersLoading && !ordersError && orders.map((order, index) => (
              <div
                key={order._id}
                className={`
                  flex
                  flex-col
                  gap-3
                  px-7
                  py-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  ${index !== orders.length - 1 ? 'border-b border-white/[0.05]' : ''}
                `}
              >

                <div>

                  <p className="text-[12px] text-white/80">
                    {order.items.map((item) => item.name).join(', ')}
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    {order.merchant?.storeName || 'SHIRU merchant'} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>

                </div>

                <div className="flex shrink-0 items-center gap-6">

                  <p className="text-[12px] text-white/60">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </p>

                  <span
                    className={`font-mono text-[9px] uppercase tracking-[0.2em] ${
                      ORDER_STATUS_STYLES[order.status] || 'text-white/40'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* ============================================= */}
      {/* BUY PANEL */}
      {/* ============================================= */}

      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">

          <div
            className="
              max-h-[88vh]
              w-full
              max-w-[440px]
              overflow-y-auto
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#0b0b0b]/95
              shadow-2xl
              backdrop-blur-xl
            "
          >

            <div className="px-8 pb-8 pt-8">

              <div className="flex items-start justify-between">

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                    Checkout
                  </p>
                  <h2 className="mt-2 text-[18px] font-medium">
                    {selectedProduct.name}
                  </h2>
                  <p className="mt-1 text-[12px] text-white/40">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <button
                  onClick={closeBuyPanel}
                  className="text-lg text-white/40 hover:text-white"
                >
                  ×
                </button>

              </div>

              {/* Size */}

              {selectedProduct.sizes?.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-[11px] text-white/60">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`
                          rounded-lg
                          border
                          px-3
                          py-1.5
                          text-[11px]
                          transition
                          ${
                            selectedSize === size
                              ? 'border-white/40 bg-white/[0.1] text-white'
                              : 'border-white/10 text-white/50 hover:border-white/25'
                          }
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color */}

              {selectedProduct.colors?.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[11px] text-white/60">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`
                          rounded-lg
                          border
                          px-3
                          py-1.5
                          text-[11px]
                          transition
                          ${
                            selectedColor === color
                              ? 'border-white/40 bg-white/[0.1] text-white'
                              : 'border-white/10 text-white/50 hover:border-white/25'
                          }
                        `}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}

              <div className="mt-5">
                <p className="mb-2 text-[11px] text-white/60">Quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded-lg border border-white/10 text-white/60 hover:border-white/25"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-[13px]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(selectedProduct.stock, q + 1))}
                    className="h-8 w-8 rounded-lg border border-white/10 text-white/60 hover:border-white/25"
                  >
                    +
                  </button>
                  <span className="text-[10px] text-white/30">
                    {selectedProduct.stock} in stock
                  </span>
                </div>
              </div>

              {/* Shipping */}

              <div className="mt-6 space-y-3">

                <p className="text-[11px] text-white/60">Shipping details</p>

                <input
                  id="name"
                  value={shipping.name}
                  onChange={handleShippingChange}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />

                <input
                  id="phone"
                  value={shipping.phone}
                  onChange={handleShippingChange}
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />

                <input
                  id="addressLine1"
                  value={shipping.addressLine1}
                  onChange={handleShippingChange}
                  placeholder="Address"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    id="city"
                    value={shipping.city}
                    onChange={handleShippingChange}
                    placeholder="City"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                  />
                  <input
                    id="postalCode"
                    value={shipping.postalCode}
                    onChange={handleShippingChange}
                    placeholder="Postal code"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                  />
                </div>

                <input
                  id="state"
                  value={shipping.state}
                  onChange={handleShippingChange}
                  placeholder="State"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />

              </div>

              {/* Error / message */}

              {buyError && (
                <p className="mt-4 text-center text-[11px] text-red-400">
                  {buyError}
                </p>
              )}

              {buyMessage && !buyError && (
                <p className="mt-4 text-center text-[11px] text-white/50">
                  {buyMessage}
                </p>
              )}

              {/* Submit */}

              <button
                onClick={handleBuy}
                disabled={buyLoading}
                className="
                  mt-6
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
                {buyLoading
                  ? 'Processing...'
                  : `Pay ₹${(selectedProduct.price * quantity).toLocaleString('en-IN')}`}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  )
}

export default UserDashboard