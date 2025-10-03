"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";

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
        const res = await fetch("http://localhost:8000/customers");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
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

  const handleChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      onSelect(numValue);
    }
  };

  return (
    <Combobox
      options={customers.map(customer => ({
        label: customer.customerName,
        value: customer.id.toString()
      }))}
      value={selectedValue ? selectedValue.toString() : ""}
      onChange={handleChange}
      placeholder={loading ? "Loading customers..." : placeholder}
      disabled={loading}
    />
  );
}
