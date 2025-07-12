"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";

type Site = {
  id: number;
  siteName: string;
  customerId?: number;
};

type Props = {
  selectedValue: number | undefined;
  onSelect: (value: number) => void;
  placeholder?: string;
  customerId?: number; // Filter sites by customer
};

export function SimpleSiteSelect({
  selectedValue,
  onSelect,
  placeholder = "Select site...",
  customerId,
}: Props) {
  const [sites, setSites] = React.useState<Site[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSites() {
      try {
        const res = await fetch("http://192.168.29.167:8000/sites");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setSites(data || []);
      } catch (error) {
        console.error("❌ SimpleSiteSelect: Failed to fetch sites:", error);
        setSites([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSites();
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
        placeholder="Loading sites..."
        disabled={true}
      />
    );
  }

  // Filter sites by customer if customerId is provided
  const filteredSites = customerId 
    ? sites.filter(site => site.customerId === customerId)
    : sites;

  return (
    <Combobox
      options={filteredSites.map(site => ({
        label: site.siteName,
        value: site.id.toString()
      }))}
      value={selectedValue ? selectedValue.toString() : ""}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
