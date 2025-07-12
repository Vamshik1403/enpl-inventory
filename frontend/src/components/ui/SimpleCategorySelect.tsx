"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";

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
        const res = await fetch("http://192.168.29.167:8000/category");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
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

  const handleChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const selectedCategory = categories.find(cat => cat.id === numValue);
      onSelect(numValue, selectedCategory?.subCategories);
    }
  };

  if (loading) {
    return (
      <Combobox
        options={[]}
        value=""
        onChange={() => {}}
        placeholder="Loading categories..."
        disabled={true}
      />
    );
  }

  return (
    <Combobox
      options={categories.map(category => ({
        label: category.categoryName,
        value: category.id.toString()
      }))}
      value={selectedValue ? selectedValue.toString() : ""}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
