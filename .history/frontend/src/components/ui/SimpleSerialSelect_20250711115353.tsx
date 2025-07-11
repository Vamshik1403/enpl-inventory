"use client";

import * as React from "react";

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
        console.log("🔄 SimpleSerialSelect: Fetching serial numbers...");
        const res = await fetch("http://192.168.0.102:8000/inventory");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const inventoryData = await res.json();
        console.log("✅ SimpleSerialSelect: Inventory data fetched:", inventoryData?.length || 0);
        
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
        
        console.log("✅ SimpleSerialSelect: Serial numbers extracted:", allSerialNumbers.length);
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSerial = e.target.value;
    console.log("🎯 SimpleSerialSelect: Serial number selected:", selectedSerial);
    
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
      <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
        <option>Loading serial numbers...</option>
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
      {serialNumbers.map((item) => (
        <option key={item.id} value={item.serialNumber}>
          {item.serialNumber} {item.product?.productName ? `- ${item.product.productName}` : ''}
        </option>
      ))}
    </select>
  );
}
