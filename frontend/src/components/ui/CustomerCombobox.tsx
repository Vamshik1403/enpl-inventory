"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Customer = {
  id: number;
  customerName: string;
};

type Props = {
  selectedValue: number;
  onSelect: (value: number) => void;
  placeholder?: string;
};

export function CustomerCombobox({
  selectedValue,
  onSelect,
  placeholder = "Search customer...",
}: Props) {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

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
        console.error("❌ Failed to fetch customers:", error);
        setCustomers([]);
      }
    }
    fetchCustomers();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedValue);
  const filteredCustomers = customers.filter((customer) =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCustomer = (customerId: string) => {
    const id = parseInt(customerId);
    onSelect(id);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="w-full">
      {/* Simple Select Dropdown */}
      <Select
        value={selectedValue > 0 ? selectedValue.toString() : ""}
        onValueChange={handleSelectCustomer}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedCustomer ? selectedCustomer.customerName : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {/* Search input inside dropdown */}
          <div className="p-2 border-b">
            <Input
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {customers.length === 0 ? (
            <SelectItem value="loading" disabled>
              Loading customers...
            </SelectItem>
          ) : filteredCustomers.length === 0 ? (
            <SelectItem value="no-results" disabled>
              No customers found for "{searchTerm}"
            </SelectItem>
          ) : (
            filteredCustomers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                <div className="flex items-center">
                  {selectedValue === customer.id && (
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                  )}
                  <span>{customer.customerName}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
