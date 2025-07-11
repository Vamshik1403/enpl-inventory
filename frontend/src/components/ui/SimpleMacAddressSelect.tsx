"use client";

import * as React from "react";

type MacAddress = {
  id: number;
  macAddress: string;
  serialNumber?: string;
  product?: {
    productName: string;
  };
};

type Props = {
  selectedValue: string | undefined;
  onSelect: (macAddress: string, serialNumber?: string, productName?: string) => void;
  placeholder?: string;
};

export function SimpleMacAddressSelect({
  selectedValue,
  onSelect,
  placeholder = "Select MAC address...",
}: Props) {
  const [macAddresses, setMacAddresses] = React.useState<MacAddress[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMacAddresses() {
      try {
        console.log("🔄 SimpleMacAddressSelect: Fetching MAC addresses...");
        const res = await fetch("http://192.168.29.167:8000/inventory");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const inventoryData = await res.json();
        console.log("✅ SimpleMacAddressSelect: Inventory data fetched:", inventoryData?.length || 0);
        
        // Extract MAC addresses from the nested structure
        const allMacAddresses: MacAddress[] = [];
        inventoryData.forEach((inventory: any) => {
          if (inventory.products && Array.isArray(inventory.products)) {
            inventory.products.forEach((productInventory: any) => {
              if (productInventory.macAddress) {
                allMacAddresses.push({
                  id: productInventory.id,
                  macAddress: productInventory.macAddress,
                  serialNumber: productInventory.serialNumber,
                  product: productInventory.product
                });
              }
            });
          }
        });
        
        console.log("✅ SimpleMacAddressSelect: MAC addresses extracted:", allMacAddresses.length);
        setMacAddresses(allMacAddresses);
      } catch (error) {
        console.error("❌ SimpleMacAddressSelect: Failed to fetch MAC addresses:", error);
        setMacAddresses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMacAddresses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMac = e.target.value;
    console.log("🎯 SimpleMacAddressSelect: MAC address selected:", selectedMac);
    
    if (selectedMac) {
      const item = macAddresses.find(m => m.macAddress === selectedMac);
      if (item) {
        onSelect(selectedMac, item.serialNumber, item.product?.productName);
      } else {
        onSelect(selectedMac);
      }
    }
  };

  if (loading) {
    return (
      <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
        <option>Loading MAC addresses...</option>
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
      {macAddresses.map((item) => (
        <option key={item.id} value={item.macAddress}>
          {item.macAddress} {item.product?.productName ? `- ${item.product.productName}` : ''}
        </option>
      ))}
    </select>
  );
}
