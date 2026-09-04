import React from 'react';
import Product3DCard from './Product3DCard';

export default function Product({ product, col = 4 }) {
  return <Product3DCard product={product} col={col} />;
}
