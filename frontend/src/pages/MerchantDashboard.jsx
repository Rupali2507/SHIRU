import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardNav from "../components/DashboardNav";

import {
  getMerchantProfile,
  createMerchant,
} from "../services/merchantService";

import {
  getMerchantProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

import {
  getMerchantOrders,
  updateOrderStatus,
} from "../services/orderService";

import MerchantStats from "../components/merchant/MerchantStats";
import MerchantOverview from "../components/merchant/MerchantOverview";
import MerchantCatalog from "../components/merchant/MerchantCatalog";
import MerchantOrders from "../components/merchant/MerchantOrder";
import ProductFormModal from "../components/merchant/ProductFormModal";


const TABS = [
  {
    key: "overview",
    label: "Overview",
  },
  {
    key: "catalog",
    label: "Catalog",
  },
  {
    key: "orders",
    label: "Orders",
  },
];


const MerchantDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // =====================================================
  // AUTH GUARD
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user || user.role !== "MERCHANT") {
      navigate("/signin");
    }
  }, [navigate, user]);


  // =====================================================
  // TAB
  // =====================================================

  const [activeTab, setActiveTab] = useState("overview");


  // =====================================================
  // MERCHANT PROFILE
  // =====================================================

  const [merchant, setMerchant] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [storeForm, setStoreForm] = useState({
    storeName: "",
    description: "",
    website: "",
  });

  const [storeLoading, setStoreLoading] = useState(false);
  const [storeError, setStoreError] = useState("");


  const loadProfile = async () => {
    try {
      setProfileLoading(true);

      const data = await getMerchantProfile();

      setMerchant(data);

      if (data) {
        setStoreForm({
          storeName: data.storeName || "",
          description: data.description || "",
          website: data.website || "",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProfileLoading(false);
    }
  };


  useEffect(() => {
    loadProfile();
  }, []);


  const handleStoreChange = (e) => {
    setStoreForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };


  const handleCreateStore = async (e) => {
    e.preventDefault();

    setStoreError("");

    if (!storeForm.storeName.trim()) {
      setStoreError("Store name is required");
      return;
    }

    try {
      setStoreLoading(true);

      const created = await createMerchant(storeForm);

      setMerchant(created);
    } catch (error) {
      setStoreError(
        error.message || "Unable to create store"
      );
    } finally {
      setStoreLoading(false);
    }
  };


  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");


  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");

      const data = await getMerchantProducts();

      setProducts(data || []);
    } catch (error) {
      setProductsError(
        error.message || "Unable to load products"
      );
    } finally {
      setProductsLoading(false);
    }
  };


  useEffect(() => {
    if (
      merchant &&
      (activeTab === "overview" ||
        activeTab === "catalog")
    ) {
      loadProducts();
    }
  }, [merchant, activeTab]);


  // =====================================================
  // PRODUCT FORM
  // =====================================================

  const [showProductForm, setShowProductForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [productFormLoading, setProductFormLoading] =
    useState(false);

  const [productFormError, setProductFormError] =
    useState("");


  const openNewProductForm = () => {
    setEditingProduct(null);
    setProductFormError("");
    setShowProductForm(true);
  };


  const openEditProductForm = (product) => {
    setEditingProduct(product);
    setProductFormError("");
    setShowProductForm(true);
  };


  const closeProductForm = () => {
    if (productFormLoading) return;

    setShowProductForm(false);
    setEditingProduct(null);
    setProductFormError("");
  };


  // =====================================================
  // SAVE PRODUCT
  // =====================================================

  const handleSaveProduct = async (form) => {
    setProductFormError("");

    // Basic validation
    if (
      !form.name?.trim() ||
      !form.description?.trim() ||
      !form.category?.trim() ||
      !form.price ||
      !form.sku?.trim()
    ) {
      setProductFormError(
        "Name, description, category, price and SKU are required"
      );

      return;
    }


    try {
      setProductFormLoading(true);


      // -------------------------------------------------
      // FormData
      // -------------------------------------------------

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "category",
        form.category.trim()
      );

      formData.append(
        "brand",
        form.brand?.trim() || ""
      );

      formData.append(
        "price",
        String(Number(form.price))
      );

      formData.append(
        "sku",
        form.sku.trim()
      );

      formData.append(
        "stock",
        String(Number(form.stock) || 0)
      );


      // -------------------------------------------------
      // Arrays
      // -------------------------------------------------

      // -------------------------------------------------
// Arrays
// -------------------------------------------------

const sizes = Array.isArray(form.sizes)
  ? form.sizes
  : [];

const colors = Array.isArray(form.colors)
  ? form.colors
  : [];

formData.append(
  "sizes",
  JSON.stringify(sizes)
);

formData.append(
  "colors",
  JSON.stringify(colors)
);


      // -------------------------------------------------
      // Images
      // -------------------------------------------------

      if (form.images?.length > 0) {
        form.images.forEach((file) => {
          formData.append("images", file);
        });
      }


      // -------------------------------------------------
      // CREATE / UPDATE
      // -------------------------------------------------

      if (editingProduct?._id) {
        await updateProduct(
          editingProduct._id,
          formData
        );
      } else {
        await createProduct(formData);
      }


      // -------------------------------------------------
      // Refresh
      // -------------------------------------------------

      closeProductForm();

      await loadProducts();

    } catch (error) {
      setProductFormError(
        error.message || "Unable to save product"
      );
    } finally {
      setProductFormLoading(false);
    }
  };


  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Remove this product from your catalog?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(id);

      await loadProducts();
    } catch (error) {
      console.error(error);

      setProductsError(
        error.message || "Unable to remove product"
      );
    }
  };


  // =====================================================
  // ORDERS
  // =====================================================

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] =
    useState(false);
  const [ordersError, setOrdersError] =
    useState("");


  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");

      const data = await getMerchantOrders();

      setOrders(data || []);
    } catch (error) {
      setOrdersError(
        error.message || "Unable to load orders"
      );
    } finally {
      setOrdersLoading(false);
    }
  };


  useEffect(() => {
    if (
      merchant &&
      (activeTab === "overview" ||
        activeTab === "orders")
    ) {
      loadOrders();
    }
  }, [merchant, activeTab]);


  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const handleOrderStatusChange = async (
    orderId,
    status
  ) => {
    try {
      await updateOrderStatus(
        orderId,
        status
      );

      await loadOrders();
    } catch (error) {
      console.error(error);

      setOrdersError(
        error.message ||
          "Unable to update order status"
      );
    }
  };


  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const activeProducts = products.filter(
      (product) =>
        product.status === "ACTIVE" &&
        product.aiEnabled !== false
    ).length;

    const totalOrders = orders.filter(
      (order) => order.status !== "CANCELLED"
    ).length;

    const revenue = orders
      .filter(
        (order) =>
          order.status !== "CANCELLED"
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.totalAmount || 0),
        0
      );

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      revenue,
    };
  }, [products, orders]);


  // =====================================================
  // LOADING PROFILE
  // =====================================================

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white">
        <DashboardNav />

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-[12px] text-white/30">
            Loading merchant dashboard...
          </p>
        </div>
      </div>
    );
  }


  // =====================================================
  // CREATE STORE
  // =====================================================

  if (!merchant) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white">
        <DashboardNav />

        <main className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
              Merchant onboarding
            </p>

            <h1 className="mt-3 text-2xl font-medium">
              Create your store
            </h1>

            <p className="mt-2 text-[12px] text-white/40">
              Connect your catalog to SHIRU so AI
              buyers can discover your products.
            </p>


            <form
              onSubmit={handleCreateStore}
              className="mt-8 space-y-4"
            >
              <input
                id="storeName"
                value={storeForm.storeName}
                onChange={handleStoreChange}
                placeholder="Store name"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/25"
                required
              />

              <textarea
                id="description"
                value={storeForm.description}
                onChange={handleStoreChange}
                placeholder="Tell buyers what your store sells..."
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/25"
              />

              <input
                id="website"
                value={storeForm.website}
                onChange={handleStoreChange}
                placeholder="Website (optional)"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-white/25"
              />

              {storeError && (
                <p className="text-[11px] text-red-400">
                  {storeError}
                </p>
              )}

              <button
                type="submit"
                disabled={storeLoading}
                className="rounded-full bg-white px-6 py-3 text-[11px] font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {storeLoading
                  ? "Creating..."
                  : "Create store"}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }


  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">

      <DashboardNav />


      <main className="mx-auto max-w-6xl px-6 pb-16 pt-24">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
              Merchant workspace
            </p>

            <h1 className="mt-2 text-3xl font-medium tracking-[-0.04em]">
              {merchant.storeName}
            </h1>

            <p className="mt-2 max-w-xl text-[12px] text-white/35">
              Manage your catalog, orders and
              AI-ready commerce presence.
            </p>
          </div>


          {/* Store status */}

          <div className="flex items-center gap-3">

            <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {merchant.status || "ACTIVE"}
            </span>

            {merchant.aiEnabled !== false && (
              <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                AI READY
              </span>
            )}

          </div>

        </div>


        {/* ================================================= */}
        {/* TABS */}
        {/* ================================================= */}

        <div className="mt-8 flex gap-6 border-b border-white/[0.07]">

          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                setActiveTab(tab.key)
              }
              className={`
                relative pb-4 text-[11px] transition
                ${
                  activeTab === tab.key
                    ? "text-white"
                    : "text-white/35 hover:text-white/70"
                }
              `}
            >
              {tab.label}

              {activeTab === tab.key && (
                <span className="absolute bottom-[-1px] left-0 h-px w-full bg-white" />
              )}
            </button>
          ))}

        </div>


        {/* ================================================= */}
        {/* OVERVIEW */}
        {/* ================================================= */}

        {activeTab === "overview" && (
          <>
            <MerchantStats stats={stats} />

            <MerchantOverview
              stats={stats}
              orders={orders}
              onManageCatalog={() =>
                setActiveTab("catalog")
              }
              onViewOrders={() =>
                setActiveTab("orders")
              }
            />
          </>
        )}


        {/* ================================================= */}
        {/* CATALOG */}
        {/* ================================================= */}

        {activeTab === "catalog" && (
          <MerchantCatalog
            products={products}
            loading={productsLoading}
            error={productsError}
            onAddProduct={
              openNewProductForm
            }
            onEditProduct={
              openEditProductForm
            }
            onDeleteProduct={
              handleDeleteProduct
            }
          />
        )}


        {/* ================================================= */}
        {/* ORDERS */}
        {/* ================================================= */}

        {activeTab === "orders" && (
          <MerchantOrders
            orders={orders}
            loading={ordersLoading}
            error={ordersError}
            onStatusChange={
              handleOrderStatusChange
            }
          />
        )}

      </main>


      {/* ================================================= */}
      {/* PRODUCT MODAL */}
      {/* ================================================= */}

      <ProductFormModal
        isOpen={showProductForm}
        editingProduct={editingProduct}
        loading={productFormLoading}
        error={productFormError}
        onClose={closeProductForm}
        onSubmit={handleSaveProduct}
        onImagesChange={() => {}}
      />

    </div>
  );
};


export default MerchantDashboard;