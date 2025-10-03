"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";

type SerialNumber = {
  id: number;
  serialNumber: string;
  macAddress?: string;
  product?: {
    productName: string;
  };
};

type Props = {
  selectedValue: string | undefined;
  onSelect: (serialNumber: string, macAddress?: string, productName?: string) => void;
  placeholder?: string;
};

export function SimpleSerialSelect({
  selectedValue,
  onSelect,
  placeholder = "Select serial number...",
}: Props) {
  const [serialNumbers, setSerialNumbers] = React.useState<SerialNumber[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSerialNumbers() {
      try {
        const res = await fetch("http://localhost:8000/inventory");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const inventoryData = await res.json();
        
        // Extract serial numbers from the nested structure
        const allSerialNumbers: SerialNumber[] = [];
        inventoryData.forEach((inventory: any) => {
          if (inventory.products && Array.isArray(inventory.products)) {
            inventory.products.forEach((productInventory: any) => {
              if (productInventory.serialNumber) {
                allSerialNumbers.push({
                  id: productInventory.id,
                  serialNumber: productInventory.serialNumber,
                  macAddress: productInventory.macAddress,
                  product: productInventory.product
                });
              }
            });
          }
        });
        
        setSerialNumbers(allSerialNumbers);
      } catch (error) {
        console.error("❌ SimpleSerialSelect: Failed to fetch serial numbers:", error);
        setSerialNumbers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSerialNumbers();
  }, []);

  const handleChange = (selectedSerial: string) => {
    if (selectedSerial) {
      const item = serialNumbers.find(s => s.serialNumber === selectedSerial);
      if (item) {
        onSelect(selectedSerial, item.macAddress, item.product?.productName);
      } else {
        onSelect(selectedSerial);
      }
    }
  };

  if (loading) {
    return (
      <Combobox
        options={[]}
        value=""
        onChange={() => {}}
        placeholder="Loading serial numbers..."
        disabled={true}
      />
    );
  }

  return (
    <Combobox
      options={serialNumbers.map(item => ({
        label: `${item.serialNumber}${item.product?.productName ? ` - ${item.product.productName}` : ''}`,
        value: item.serialNumber
      }))}
      value={selectedValue || ""}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
