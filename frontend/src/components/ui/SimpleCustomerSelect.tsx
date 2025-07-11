"use client";

import * as React from "react";

type Customer = {
  id: number;
  customerName: string;
};

type Props = {
  selectedValue: number;
  onSelect: (value: number) => void;
  placeholder?: string;
};

export function SimpleCustomerSelect({
  selectedValue,
  onSelect,
  placeholder = "Select customer...",
}: Props) {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCustomers() {
      try {
        console.log("🔄 SimpleCustomerSelect: Fetching customers...");
        const res = await fetch("http://192.168.29.167:8000/customers");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("✅ SimpleCustomerSelect: Customers fetched:", data?.length || 0);
        setCustomers(data || []);
      } catch (error) {
        console.error("❌ SimpleCustomerSelect: Failed to fetch customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    console.log("🎯 SimpleCustomerSelect: Customer selected:", value);
    if (!isNaN(value)) {
      onSelect(value);
    }
  };

  return (
    <select
      value={selectedValue || ""}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      disabled={loading}
    >
      <option value="">{loading ? "Loading customers..." : placeholder}</option>
      {customers.map((customer) => (
        <option key={customer.id} value={customer.id}>
          {customer.customerName}
        </option>
      ))}
    </select>
  );
}
