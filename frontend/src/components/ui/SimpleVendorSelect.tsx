"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";

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
        const res = await fetch("http://localhost:8000/vendors");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
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

  const handleChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      onSelect(numValue);
    }
  };

  return (
    <Combobox
      options={vendors.map(vendor => ({
        label: vendor.vendorName,
        value: vendor.id.toString()
      }))}
      value={selectedValue && selectedValue > 0 ? selectedValue.toString() : ""}
      onChange={handleChange}
      placeholder={loading ? "Loading vendors..." : placeholder}
      disabled={loading}
    />
  );
}
