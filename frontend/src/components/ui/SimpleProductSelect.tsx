"use client";

import * as React from "react";

type Product = {
  id: number;
  productName: string;
  productDescription?: string;
};

type Props = {
  selectedValue: number | undefined;
  onSelect: (value: number) => void;
  placeholder?: string;
};

export function SimpleProductSelect({
  selectedValue,
  onSelect,
  placeholder = "Select product...",
}: Props) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://192.168.29.167:8000/products");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setProducts(data || []);
      } catch (error) {
        console.error("❌ SimpleProductSelect: Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      onSelect(value);
    }
  };

  if (loading) {
    return (
      <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
        <option>Loading products...</option>
      </select>
    );
  }

  return (
    <select
      value={selectedValue || ""}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">{placeholder}</option>
      {products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.productName}
        </option>
      ))}
    </select>
  );
}
