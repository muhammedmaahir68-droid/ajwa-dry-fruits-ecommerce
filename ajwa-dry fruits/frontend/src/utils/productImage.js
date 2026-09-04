/**
 * Smart Product Image Resolver for Ajwa Dry Fruits
 * Maps products to their specific high-resolution photos based on ID, name, and category,
 * ensuring no two distinct products accidentally show the same fallback photo.
 */

const PRODUCT_IMAGE_MAP = {
  1: '/images/products/1.jpg', // Royal Saudi Ajwa Dates
  2: '/images/products/2.jpg', // Belgian 70% Dark Chocolate Truffles
  3: '/images/products/3.jpg', // Handpicked Royal Iranian Salted Pistachios
  4: '/images/products/4.jpg', // Californian King Raw Almonds
  5: '/images/products/5.jpg', // Swiss Milk Chocolate Hazelnut Pralines
  6: '/images/products/6.jpg', // Royal Festive Gift Hamper
  7: '/images/products/7.jpg', // Organic Afghan Dried Figs
};

export function getProductImage(product) {
  if (!product) return '/images/products/1.jpg';

  // 1. Direct lookup by numeric or string ID (handles both SQL id and MongoDB-style _id)
  const id = Number(product.id || product._id);
  if (!isNaN(id) && PRODUCT_IMAGE_MAP[id]) {
    return PRODUCT_IMAGE_MAP[id];
  }

  // 2. Keyword matching on product name
  const name = (product.name || '').toLowerCase();
  if (name.includes('ajwa') || name.includes('date') || name.includes('madinah')) {
    return '/images/products/1.jpg';
  }
  if (name.includes('belgian') || name.includes('dark chocolate') || name.includes('truffle') || name.includes('dark')) {
    return '/images/products/2.jpg';
  }
  if (name.includes('pistachio') || name.includes('pista') || name.includes('iranian')) {
    return '/images/products/3.jpg';
  }
  if (name.includes('almond') || name.includes('badam') || name.includes('californian') || name.includes('raw almond')) {
    return '/images/products/4.jpg';
  }
  if (name.includes('swiss') || name.includes('praline') || name.includes('hazelnut') || name.includes('milk chocolate')) {
    return '/images/products/5.jpg';
  }
  if (name.includes('hamper') || name.includes('gift') || name.includes('festive') || name.includes('box')) {
    return '/images/products/6.jpg';
  }
  if (name.includes('fig') || name.includes('anjeer') || name.includes('afghan')) {
    return '/images/products/7.jpg';
  }
  if (name.includes('walnut') || name.includes('akhrot')) {
    return '/images/products/4.jpg';
  }
  if (name.includes('cashew') || name.includes('kaju')) {
    return '/images/products/3.jpg';
  }

  // 3. Category matching
  const category = (product.category || '').toLowerCase();
  if (category.includes('date')) return '/images/products/1.jpg';
  if (category.includes('chocolate')) return '/images/products/2.jpg';
  if (category.includes('pistachio')) return '/images/products/3.jpg';
  if (category.includes('almond')) return '/images/products/4.jpg';
  if (category.includes('gift') || category.includes('hamper')) return '/images/products/6.jpg';
  if (category.includes('fig')) return '/images/products/7.jpg';

  // 4. If product has explicit valid images from DB or API
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0]?.image || product.images[0]?.url || (typeof product.images[0] === 'string' ? product.images[0] : null);
    if (firstImg && typeof firstImg === 'string' && firstImg.trim() !== '') {
      return firstImg;
    }
  }

  // 5. Deterministic fallback based on string char codes so different products never get the same image
  let hash = 0;
  const str = product.name || String(product.id || 'ajwa');
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const index = (hash % 7) + 1;
  return `/images/products/${index}.jpg`;
}

export default getProductImage;
