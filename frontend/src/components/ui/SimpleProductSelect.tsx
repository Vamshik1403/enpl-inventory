"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";

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

  const handleChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      onSelect(numValue);
    }
  };

  if (loading) {
    return (
      <Combobox
        options={[]}
        value=""
        onChange={() => {}}
        placeholder="Loading products..."
        disabled={true}
      />
    );
  }

  return (
    <Combobox
      options={products.map(product => ({
        label: product.productName,
        value: product.id.toString()
      }))}
      value={selectedValue ? selectedValue.toString() : ""}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
