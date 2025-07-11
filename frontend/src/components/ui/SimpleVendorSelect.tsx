"use client";

import * as React from "react";

type Vendor = {
  id: number;
  vendorName: string;
};

type Props = {
  selectedValue: number | undefined;
  onSelect: (value: number) => void;
  placeholder?: string;
};

export function SimpleVendorSelect({
  selectedValue,
  onSelect,
  placeholder = "Select vendor...",
}: Props) {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchVendors() {
      try {
        console.log("🔄 SimpleVendorSelect: Fetching vendors...");
        const res = await fetch("http://192.168.29.167:8000/vendors");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("✅ SimpleVendorSelect: Vendors fetched:", data?.length || 0);
        setVendors(data || []);
      } catch (error) {
        console.error("❌ SimpleVendorSelect: Failed to fetch vendors:", error);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    console.log("🎯 SimpleVendorSelect: Vendor selected:", value);
    if (!isNaN(value)) {
      onSelect(value);
    }
  };

  return (
    <select
      value={selectedValue && selectedValue > 0 ? selectedValue : ""}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      disabled={loading}
    >
      <option value="">{loading ? "Loading vendors..." : placeholder}</option>
      {vendors.map((vendor) => (
        <option key={vendor.id} value={vendor.id}>
          {vendor.vendorName}
        </option>
      ))}
    </select>
  );
}
