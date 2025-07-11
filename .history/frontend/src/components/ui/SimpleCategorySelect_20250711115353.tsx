"use client";

import * as React from "react";

type Category = {
  id: number;
  categoryName: string;
  subCategories?: { id: number; subCategoryName: string }[];
};

type Props = {
  selectedValue: number | string | undefined;
  onSelect: (value: number, subCategories?: { id: number; subCategoryName: string }[]) => void;
  placeholder?: string;
};

export function SimpleCategorySelect({
  selectedValue,
  onSelect,
  placeholder = "Select category...",
}: Props) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        console.log("🔄 SimpleCategorySelect: Fetching categories...");
        const res = await fetch("http://192.168.0.102:8000/category");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("✅ SimpleCategorySelect: Categories fetched:", data?.length || 0);
        setCategories(data || []);
      } catch (error) {
        console.error("❌ SimpleCategorySelect: Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    console.log("🎯 SimpleCategorySelect: Category selected:", value);
    if (!isNaN(value)) {
      const selectedCategory = categories.find(cat => cat.id === value);
      onSelect(value, selectedCategory?.subCategories);
    }
  };

  if (loading) {
    return (
      <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
        <option>Loading categories...</option>
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
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.categoryName}
        </option>
      ))}
    </select>
  );
}
