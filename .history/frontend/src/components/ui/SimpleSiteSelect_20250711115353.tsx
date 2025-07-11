"use client";

import * as React from "react";

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
        console.log("🔄 SimpleSiteSelect: Fetching sites...");
        const res = await fetch("http://192.168.0.102:8000/sites");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("✅ SimpleSiteSelect: Sites fetched:", data?.length || 0);
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    console.log("🎯 SimpleSiteSelect: Site selected:", value);
    if (!isNaN(value)) {
      onSelect(value);
    }
  };

  if (loading) {
    return (
      <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
        <option>Loading sites...</option>
      </select>
    );
  }

  // Filter sites by customer if customerId is provided
  const filteredSites = customerId 
    ? sites.filter(site => site.customerId === customerId)
    : sites;

  return (
    <select
      value={selectedValue || ""}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">{placeholder}</option>
      {filteredSites.map((site) => (
        <option key={site.id} value={site.id}>
          {site.siteName}
        </option>
      ))}
    </select>
  );
}