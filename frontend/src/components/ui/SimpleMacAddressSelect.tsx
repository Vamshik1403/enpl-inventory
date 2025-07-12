"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";

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
        const res = await fetch("http://192.168.29.167:8000/inventory");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const inventoryData = await res.json();
        
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

  const handleChange = (selectedMac: string) => {
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
      <Combobox
        options={[]}
        value=""
        onChange={() => {}}
        placeholder="Loading MAC addresses..."
        disabled={true}
      />
    );
  }

  return (
    <Combobox
      options={macAddresses.map(item => ({
        label: `${item.macAddress}${item.product?.productName ? ` - ${item.product.productName}` : ''}`,
        value: item.macAddress
      }))}
      value={selectedValue || ""}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
