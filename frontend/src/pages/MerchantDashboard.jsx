import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import { getMerchantProfile, createMerchant } from '../services/merchantService'
import {
  getMerchantProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService'
import { getMerchantOrders, updateOrderStatus } from '../services/orderService'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'orders', label: 'Orders' },
]

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

const EMPTY_PRODUCT = {
  name: '',
  description: '',
  category: '',
  brand: '',
  price: '',
  sku: '',
  stock: '',
  sizes: '',
  colors: '',
}

const MerchantDashboard = () => {

  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // -------------------------
  // Guard route
  // -------------------------

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token || !user || user.role !== 'MERCHANT') {
      navigate('/signin')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [activeTab, setActiveTab] = useState('overview')

  // -------------------------
  // Merchant profile
  // -------------------------

  const [merchant, setMerchant] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const [storeForm, setStoreForm] = useState({
    storeName: '',
    description: '',
    website: '',
  })
  const [storeLoading, setStoreLoading] = useState(false)
  const [storeError, setStoreError] = useState('')

  const loadProfile = async () => {
    try {
      setProfileLoading(true)
      const data = await getMerchantProfile()
      setMerchant(data)
    } catch (error) {
      console.error(error)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleStoreChange = (e) => {
    setStoreForm({ ...storeForm, [e.target.id]: e.target.value })
  }

  const handleCreateStore = async (e) => {
    e.preventDefault()
    setStoreError('')

    if (!storeForm.storeName) {
      setStoreError('Store name is required')
      return
    }

    try {
      setStoreLoading(true)
      const created = await createMerchant(storeForm)
      setMerchant(created)
    } catch (error) {
      setStoreError(error.message || 'Unable to create store')
    } finally {
      setStoreLoading(false)
    }
  }

  // -------------------------
  // Products
  // -------------------------

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState('')

  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      setProductsError('')
      const data = await getMerchantProducts()
      setProducts(data)
    } catch (error) {
      setProductsError(error.message || 'Unable to load products')
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    if (merchant && (activeTab === 'catalog' || activeTab === 'overview')) {
      loadProducts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant, activeTab])

  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [productFormLoading, setProductFormLoading] = useState(false)
  const [productFormError, setProductFormError] = useState('')

  const openNewProductForm = () => {
    setEditingProductId(null)
    setProductForm(EMPTY_PRODUCT)
    setProductFormError('')
    setShowProductForm(true)
  }

  const openEditProductForm = (product) => {
    setEditingProductId(product._id)
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand || '',
      price: product.price,
      sku: product.sku,
      stock: product.stock,
      sizes: (product.sizes || []).join(', '),
      colors: (product.colors || []).join(', '),
    })
    setProductFormError('')
    setShowProductForm(true)
  }

  const closeProductForm = () => {
    setShowProductForm(false)
    setEditingProductId(null)
  }

  const handleProductFormChange = (e) => {
    setProductForm({ ...productForm, [e.target.id]: e.target.value })
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setProductFormError('')

    if (!productForm.name || !productForm.description || !productForm.category || !productForm.price || !productForm.sku) {
      setProductFormError('Name, description, category, price and SKU are required')
      return
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      brand: productForm.brand,
      price: Number(productForm.price),
      sku: productForm.sku,
      stock: Number(productForm.stock) || 0,
      sizes: productForm.sizes
        ? productForm.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      colors: productForm.colors
        ? productForm.colors.split(',').map((c) => c.trim()).filter(Boolean)
        : [],
    }

    try {
      setProductFormLoading(true)

      if (editingProductId) {
        await updateProduct(editingProductId, payload)
      } else {
        await createProduct(payload)
      }

      closeProductForm()
      loadProducts()

    } catch (error) {
      setProductFormError(error.message || 'Unable to save product')
    } finally {
      setProductFormLoading(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id)
      loadProducts()
    } catch (error) {
      console.error(error)
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
      const data = await getMerchantOrders()
      setOrders(data)
    } catch (error) {
      setOrdersError(error.message || 'Unable to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (merchant && activeTab === 'orders') {
      loadOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant, activeTab])

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status)
      loadOrders()
    } catch (error) {
      console.error(error)
    }
  }

  // -------------------------
  // Stats
  // -------------------------

  const stats = useMemo(() => {
    const activeProducts = products.filter((p) => p.status === 'ACTIVE').length

    const revenue = orders
      .filter((o) => ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0)

    return {
      totalProducts: products.length,
      activeProducts,
      totalOrders: orders.length,
      revenue,
    }
  }, [products, orders])

  // -------------------------
  // Loading state
  // -------------------------

  if (profileLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-[12px] text-white/30">Loading your store...</p>
      </main>
    )
  }

  // -------------------------
  // No store yet — onboarding
  // -------------------------

  if (!merchant) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035),transparent_55%)]" />

        <DashboardNav eyebrow="Merchant onboarding" />

        <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-[72px]">

          <div className="w-full max-w-[420px] overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0b0b0b]/95 shadow-2xl backdrop-blur-xl">

            <form onSubmit={handleCreateStore} className="px-9 pb-8 pt-9">

              <div className="mb-5 text-center text-lg text-white/70">✦</div>

              <h1 className="text-center text-[19px] font-medium">
                Set up your store
              </h1>

              <p className="mt-2 text-center text-[12px] text-white/40">
                Make your catalog AI-transactable for SHIRU buyers.
              </p>

              <div className="mt-7">
                <label htmlFor="storeName" className="mb-2 block text-[11px] text-white/70">
                  Store name
                </label>
                <input
                  id="storeName"
                  value={storeForm.storeName}
                  onChange={handleStoreChange}
                  placeholder="e.g. Puma Official"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="description" className="mb-2 block text-[11px] text-white/70">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={storeForm.description}
                  onChange={handleStoreChange}
                  placeholder="What does your store sell?"
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="website" className="mb-2 block text-[11px] text-white/70">
                  Website (optional)
                </label>
                <input
                  id="website"
                  value={storeForm.website}
                  onChange={handleStoreChange}
                  placeholder="https://yourstore.com"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </div>

              {storeError && (
                <p className="mt-4 text-center text-[11px] text-red-400">{storeError}</p>
              )}

              <button
                type="submit"
                disabled={storeLoading}
                className="mt-7 w-full rounded-lg bg-white px-4 py-3 text-[12px] font-medium text-black transition-all hover:scale-[1.01] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {storeLoading ? 'Creating store...' : 'Create store'}
              </button>

            </form>

          </div>

        </section>

      </main>
    )
  }

  // -------------------------
  // Merchant portal
  // -------------------------

  return (
    <main className="min-h-screen bg-black text-white">

      <DashboardNav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        eyebrow={merchant.storeName}
      />

      <div className="mx-auto max-w-[1500px] px-6 pb-16 pt-[120px] lg:px-10">

        {/* Header */}

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
              Merchant control
            </p>
            <h1 className="mt-3 text-[38px] font-medium tracking-[-0.05em] md:text-[46px]">
              {merchant.storeName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
              SHIRU helps AI buyers discover your products, make decisions
              and complete purchases.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
                {merchant.status === 'ACTIVE' ? 'Live' : merchant.status}
              </span>
            </div>
          </div>

        </div>

        {/* Stats */}

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
            <p className="text-[11px] text-white/35">Total products</p>
            <p className="mt-4 text-[26px] font-medium tracking-[-0.04em]">
              {stats.totalProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
            <p className="text-[11px] text-white/35">Active products</p>
            <p className="mt-4 text-[26px] font-medium tracking-[-0.04em]">
              {stats.activeProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
            <p className="text-[11px] text-white/35">Orders</p>
            <p className="mt-4 text-[26px] font-medium tracking-[-0.04em]">
              {stats.totalOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
            <p className="text-[11px] text-white/35">Revenue</p>
            <p className="mt-4 text-[26px] font-medium tracking-[-0.04em]">
              ₹{stats.revenue.toLocaleString('en-IN')}
            </p>
          </div>

        </div>

        {/* ============================================= */}
        {/* OVERVIEW TAB */}
        {/* ============================================= */}

        {activeTab === 'overview' && (
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">

            <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-7">

              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                Agent-readable catalog
              </p>
              <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em]">
                Ready for AI buyers.
              </h2>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                  <p className="text-lg font-medium">{stats.activeProducts}</p>
                  <p className="mt-1 text-[9px] text-white/30">AI-ready products</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                  <p className="text-lg font-medium">
                    {stats.totalProducts - stats.activeProducts}
                  </p>
                  <p className="mt-1 text-[9px] text-white/30">Need attention</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-6 rounded-full border border-white/10 px-5 py-2.5 text-[10px] text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Manage catalog →
              </button>

            </div>

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
                    <div key={order._id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3">
                      <p className="text-[11px] text-white/70">
                        {order.items?.[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                      </p>
                      <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${ORDER_STATUS_STYLES[order.status] || 'text-white/40'}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setActiveTab('orders')}
                className="mt-6 rounded-full border border-white/10 px-5 py-2.5 text-[10px] text-white/60 transition hover:border-white/20 hover:text-white"
              >
                View all orders →
              </button>

            </div>

          </div>
        )}

        {/* ============================================= */}
        {/* CATALOG TAB */}
        {/* ============================================= */}

        {activeTab === 'catalog' && (
          <div className="mt-10">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Your products</h2>
              <button
                onClick={openNewProductForm}
                className="rounded-full bg-white px-5 py-2.5 text-[11px] font-medium text-black transition hover:bg-white/90"
              >
                + Add product
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111]">

              {productsLoading && (
                <p className="px-7 py-10 text-center text-[12px] text-white/30">
                  Loading products...
                </p>
              )}

              {!productsLoading && productsError && (
                <p className="px-7 py-10 text-center text-[12px] text-red-400">
                  {productsError}
                </p>
              )}

              {!productsLoading && !productsError && products.length === 0 && (
                <p className="px-7 py-10 text-center text-[12px] text-white/30">
                  No products yet. Add your first one.
                </p>
              )}

              {!productsLoading && !productsError && products.map((product, index) => (
                <div
                  key={product._id}
                  className={`
                    flex flex-col gap-3 px-7 py-5 sm:flex-row sm:items-center sm:justify-between
                    ${index !== products.length - 1 ? 'border-b border-white/[0.05]' : ''}
                  `}
                >

                  <div>
                    <p className="text-[13px] text-white/85">{product.name}</p>
                    <p className="mt-1 text-[10px] text-white/30">
                      {product.category} · SKU {product.sku} · Stock {product.stock}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-5">

                    <p className="text-[12px] text-white/60">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>

                    <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${product.status === 'ACTIVE' ? 'text-emerald-400/80' : 'text-white/30'}`}>
                      {product.status}
                    </span>

                    <button
                      onClick={() => openEditProductForm(product)}
                      className="text-[10px] text-white/50 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-[10px] text-white/50 hover:text-red-400"
                    >
                      Remove
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </div>
        )}

        {/* ============================================= */}
        {/* ORDERS TAB */}
        {/* ============================================= */}

        {activeTab === 'orders' && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111]">

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
                No orders yet.
              </p>
            )}

            {!ordersLoading && !ordersError && orders.map((order, index) => {
              const nextOptions = NEXT_STATUS[order.status] || []

              return (
                <div
                  key={order._id}
                  className={`
                    flex flex-col gap-3 px-7 py-5 sm:flex-row sm:items-center sm:justify-between
                    ${index !== orders.length - 1 ? 'border-b border-white/[0.05]' : ''}
                  `}
                >

                  <div>
                    <p className="text-[12px] text-white/80">
                      {order.items.map((item) => item.name).join(', ')}
                    </p>
                    <p className="mt-1 text-[10px] text-white/30">
                      {order.user?.name || 'Customer'} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-5">

                    <p className="text-[12px] text-white/60">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </p>

                    <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${ORDER_STATUS_STYLES[order.status] || 'text-white/40'}`}>
                      {order.status}
                    </span>

                    {nextOptions.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleStatusChange(order._id, e.target.value)
                          }
                        }}
                        defaultValue=""
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[10px] text-white outline-none"
                      >
                        <option value="" disabled>
                          Update status
                        </option>
                        {nextOptions.map((status) => (
                          <option key={status} value={status} className="bg-black">
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
        )}

      </div>

      {/* ============================================= */}
      {/* PRODUCT FORM MODAL */}
      {/* ============================================= */}

      {showProductForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">

          <div className="max-h-[88vh] w-full max-w-[440px] overflow-y-auto rounded-[22px] border border-white/[0.08] bg-[#0b0b0b]/95 shadow-2xl backdrop-blur-xl">

            <form onSubmit={handleSaveProduct} className="px-8 pb-8 pt-8">

              <div className="flex items-start justify-between">
                <h2 className="text-[18px] font-medium">
                  {editingProductId ? 'Edit product' : 'Add product'}
                </h2>
                <button type="button" onClick={closeProductForm} className="text-lg text-white/40 hover:text-white">
                  ×
                </button>
              </div>

              <div className="mt-6 space-y-3">

                <input
                  id="name"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                  placeholder="Product name"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />

                <textarea
                  id="description"
                  rows={3}
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  placeholder="Description"
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    id="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    placeholder="Category"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                  />
                  <input
                    id="brand"
                    value={productForm.brand}
                    onChange={handleProductFormChange}
                    placeholder="Brand"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    id="price"
                    type="number"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    placeholder="Price (₹)"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                  />
                  <input
                    id="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={handleProductFormChange}
                    placeholder="Stock"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                  />
                </div>

                <input
                  id="sku"
                  value={productForm.sku}
                  onChange={handleProductFormChange}
                  placeholder="SKU"
                  disabled={!!editingProductId}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30 disabled:opacity-40"
                />

                <input
                  id="sizes"
                  value={productForm.sizes}
                  onChange={handleProductFormChange}
                  placeholder="Sizes (comma separated, optional)"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />

                <input
                  id="colors"
                  value={productForm.colors}
                  onChange={handleProductFormChange}
                  placeholder="Colors (comma separated, optional)"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />

              </div>

              {productFormError && (
                <p className="mt-4 text-center text-[11px] text-red-400">{productFormError}</p>
              )}

              <button
                type="submit"
                disabled={productFormLoading}
                className="mt-6 w-full rounded-lg bg-white px-4 py-3 text-[12px] font-medium text-black transition-all hover:scale-[1.01] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {productFormLoading ? 'Saving...' : editingProductId ? 'Save changes' : 'Add product'}
              </button>

            </form>

          </div>

        </div>
      )}

    </main>
  )
}

export default MerchantDashboard
