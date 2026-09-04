import React, { useEffect, useState } from "react";

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  stock: "",
  sku: "",
  sizes: "",
  colors: "",
  images: [],
};

const ProductFormModal = ({
  isOpen,
  editingProduct,
  loading,
  error,
  onClose,
  onSubmit,
  onImagesChange,
}) => {
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [imagePreviews, setImagePreviews] = useState([]);

  // -----------------------------------------
  // LOAD FORM WHEN MODAL OPENS
  // -----------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        category: editingProduct.category || "",
        brand: editingProduct.brand || "",
        price: editingProduct.price ?? "",
        stock: editingProduct.stock ?? "",
        sku: editingProduct.sku || "",

        // Convert arrays from DB into strings for inputs
        sizes: Array.isArray(editingProduct.sizes)
          ? editingProduct.sizes.join(", ")
          : editingProduct.sizes || "",

        colors: Array.isArray(editingProduct.colors)
          ? editingProduct.colors.join(", ")
          : editingProduct.colors || "",

        // New files only
        images: [],
      });

      // Existing Cloudinary images
      setImagePreviews(editingProduct.images || []);
    } else {
      setForm(EMPTY_PRODUCT);
      setImagePreviews([]);
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  // -----------------------------------------
  // INPUT CHANGE
 const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  // -----------------------------------------
  // IMAGE CHANGE
  // -----------------------------------------
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    // Only images
    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    // Existing files + newly selected files
    const combinedFiles = [
      ...form.images,
      ...validFiles,
    ].slice(0, 5);

    setForm((prev) => ({
      ...prev,
      images: combinedFiles,
    }));

    // Create previews for newly selected files
    const newPreviews = validFiles
      .slice(0, 5 - form.images.length)
      .map((file) => URL.createObjectURL(file));

    setImagePreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    // Send files to parent
    onImagesChange?.(combinedFiles);

    // Allow selecting the same file again
    e.target.value = "";
  };

  // -----------------------------------------
  // REMOVE IMAGE
  // -----------------------------------------
  const handleRemoveImage = (index) => {
    const preview = imagePreviews[index];

    // If blob preview, release memory
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const updatedPreviews = imagePreviews.filter(
      (_, i) => i !== index
    );

    setImagePreviews(updatedPreviews);

    // Only manipulate newly selected files
    const existingImageCount = editingProduct?.images?.length || 0;

    if (index >= existingImageCount) {
      const fileIndex = index - existingImageCount;

      const updatedFiles = form.images.filter(
        (_, i) => i !== fileIndex
      );

      setForm((prev) => ({
        ...prev,
        images: updatedFiles,
      }));

      onImagesChange?.(updatedFiles);
    }
  };

  // -----------------------------------------
  // SUBMIT
  // -----------------------------------------
  const handleSubmit = (e) => {
  e.preventDefault();

  const sizes = Array.isArray(form.sizes)
    ? form.sizes
    : String(form.sizes || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const colors = Array.isArray(form.colors)
    ? form.colors
    : String(form.colors || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const productData = {
    ...form,
    price: Number(form.price),
    stock: Number(form.stock),
    sizes,
    colors,
    images: form.images,
  };

  onSubmit(productData);
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">

      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0b0b] text-white shadow-2xl">

        {/* ================= HEADER ================= */}

        <div className="shrink-0 border-b border-white/[0.07] bg-[#0b0b0b] px-6 py-5">

          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-[20px] font-medium tracking-[-0.03em]">
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <p className="mt-1 text-[12px] text-white/35">
                {editingProduct
                  ? "Update your product details and images"
                  : "Add product details and images"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-xl font-light text-white/35 transition hover:bg-white/[0.06] hover:text-white"
            >
              ×
            </button>

          </div>
        </div>

        {/* ================= FORM ================= */}

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-6"
        >

          <div className="space-y-6">

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
                <p className="text-xs text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* PRODUCT NAME */}

            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Urban Runner"
                required
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.04]"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                required
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.04]"
              />
            </div>

            {/* CATEGORY + BRAND */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Running Shoes"
                  required
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.04]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Puma"
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.04]"
                />
              </div>

            </div>

            {/* PRICE + STOCK */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="3499"
                  min="0"
                  required
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.04]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="20"
                  min="0"
                  required
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.04]"
                />
              </div>

            </div>

            {/* SKU */}

            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                SKU
              </label>

              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="URBAN-RUN-X-001"
                required
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.04]"
              />
            </div>

            {/* SIZES */}

            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                Sizes
              </label>

              <input
                type="text"
                name="sizes"
                value={form.sizes}
                onChange={handleChange}
                placeholder="7, 8, 9, 10, 11"
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.04]"
              />

              <p className="mt-2 text-[10px] text-white/25">
                Separate sizes with commas
              </p>
            </div>

            {/* COLORS */}

            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                Colors
              </label>

              <input
                type="text"
                name="colors"
                value={form.colors}
                onChange={handleChange}
                placeholder="Black, White, Grey"
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.04]"
              />

              <p className="mt-2 text-[10px] text-white/25">
                Separate colors with commas
              </p>
            </div>

            {/* ================= IMAGES ================= */}

            <div>

              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                Product Images
              </label>

              <div className="mt-2 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] p-6 text-center transition hover:border-white/[0.2]">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-lg text-white/50">
                  +
                </div>

                <p className="mt-3 text-sm text-white/60">
                  Upload product images
                </p>

                <p className="mt-1 text-[11px] text-white/25">
                  PNG, JPG or WEBP · Up to 5 images
                </p>

                <label className="mt-4 inline-flex cursor-pointer items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs text-white/65 transition hover:bg-white/[0.08] hover:text-white">

                  Choose images

                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                </label>

              </div>

              {/* IMAGE PREVIEWS */}

              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">

                  {imagePreviews.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]"
                    >

                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage(index)
                        }
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white/70 opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black hover:text-white"
                      >
                        ×
                      </button>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>

          {/* ================= FOOTER ================= */}

          <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 border-t border-white/[0.07] bg-[#0b0b0b] py-4">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full px-5 py-2.5 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingProduct
                  ? "Save changes"
                  : "Add product"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default ProductFormModal;