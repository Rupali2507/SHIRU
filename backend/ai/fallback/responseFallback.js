export const formatCatalogFallback = (
  products
) => {

  if (!products.length) {

    return (
      "I couldn't find any products matching " +
      "your request right now."
    );
  }


  const topProducts =
    products.slice(0, 5);


  const productText =
    topProducts
      .map((product) => {

        const merchant =
          product.merchant?.name
            ? ` from ${product.merchant.name}`
            : "";

        return (
          `• ${product.name} — ` +
          `₹${product.price}` +
          `${merchant}`
        );
      })
      .join("\n");


  return (
    "I'm having trouble with my AI assistant " +
    "right now, but I found these products " +
    "matching your request:\n\n" +
    productText
  );
};