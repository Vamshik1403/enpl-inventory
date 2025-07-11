"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilLine, Package, Search, Download, Plus } from "lucide-react";
import { SimpleVendorSelect } from "@/components/ui/SimpleVendorSelect";
import { SimpleProductSelect } from "@/components/ui/SimpleProductSelect";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProductInventory {
  productId: number;
  make: string;
  model: string;
  serialNumber: string;
  macAddress: string;
  warrantyPeriod: string;
  purchaseRate: string;
  noSerialMac?: boolean; // New field to indicate if serial/mac is not requiredx
}

interface Inventory {
  id?: number;
  vendorId: number;
  creditTerms?: string;
  invoiceNetAmount?: string;
  gstAmount?: string;
  dueDate?: string;
  invoiceGrossAmount?: string;
  purchaseDate: string;
  purchaseInvoice: string;
  status?: string;
  duration?: string;
  products: ProductInventory[];
}

interface Vendor {
  id: number;
  vendorName: string;
}

interface Product {
  id: number;
  productName: string;
}

const initialFormState: Inventory = {
  vendorId: 0,
  purchaseDate: "",
  purchaseInvoice: "",
  status: "In Stock",
  dueDate: "",
  creditTerms: "",
  invoiceNetAmount: "",
  gstAmount: "",
  invoiceGrossAmount: "",
  products: [],
};

const InventoryTable: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<Inventory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Inventory>(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const itemsPerPage = 50;

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;

    const getValue = (obj: any, key: string) => {
      switch (key) {
        case "vendor":
          return vendors.find((v) => v.id === obj.vendorId)?.vendorName || "";
        case "purchaseDate":
        case "purchaseInvoice":
        case "status":
        case "duration":
          return obj[key] || "";
        default:
          return "";
      }
    };

    const aValue = getValue(a, key).toLowerCase?.() || "";
    const bValue = getValue(b, key).toLowerCase?.() || "";

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedInventory = sortedInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchVendors();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [inventoryList, searchQuery]);

  const fetchInventory = async () => {
    const res = await axios.get("http://http://192.168.29.167:8000/inventory");
    setInventoryList(res.data.reverse());
    const inventoryWithDuration = res.data.map((item: Inventory) => {
      const purchaseDate = new Date(item.purchaseDate);
      const today = new Date();
      const diffDays = Math.floor(
        (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        ...item,
        duration: `${diffDays} day${diffDays !== 1 ? "s" : ""}`,
      };
    });
    setInventoryList(inventoryWithDuration);
  };

  const fetchProducts = async () => {
    const res = await axios.get("http://http://192.168.29.167:8000/products");
    setProducts(res.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get("http://http://192.168.29.167:8000/vendors");
    setVendors(res.data);
  };

  const handleDownloadCSV = () => {
    if (inventoryList.length === 0) return;

    const csvData = inventoryList.flatMap((inventory) => {
      const vendorName =
        vendors.find((v) => v.id === inventory.vendorId)?.vendorName || "";
      return inventory.products.map((product) => ({
        PurchaseDate: inventory.purchaseDate,
        PurchaseInvoice: inventory.purchaseInvoice,
        Vendor: vendorName,
        Status: inventory.status || "",
        CreditTerms: inventory.creditTerms || "",
        DueDate: inventory.dueDate || "",
        InvoiceNetAmount: inventory.invoiceNetAmount || "",
        GSTAmount: inventory.gstAmount || "",
        InvoiceGrossAmount: inventory.invoiceGrossAmount || "",
        Duration: inventory.duration || "",
        ProductID: product.productId,
        Make: product.make,
        Model: product.model,
        SerialNumber: product.serialNumber,
        MacAddress: product.macAddress,
        WarrantyPeriod: product.warrantyPeriod,
        PurchaseRate: product.purchaseRate,
      }));
    });

    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();

    const filtered = inventoryList.filter((inv) => {
      const vendorName =
        vendors.find((v) => v.id === inv.vendorId)?.vendorName?.toLowerCase() ||
        "";

      const inventoryMatch =
        inv.purchaseInvoice?.toLowerCase().includes(lowerQuery) ||
        inv.products.some((product) =>
          product.serialNumber?.toLowerCase().includes(lowerQuery)
        ) ||
        inv.purchaseDate?.toLowerCase().includes(lowerQuery) ||
        inv.creditTerms?.toLowerCase().includes(lowerQuery) ||
        inv.invoiceNetAmount?.toLowerCase().includes(lowerQuery) ||
        inv.gstAmount?.toLowerCase().includes(lowerQuery) ||
        inv.invoiceGrossAmount?.toLowerCase().includes(lowerQuery) ||
        inv.status?.toLowerCase().includes(lowerQuery) ||
        vendorName.includes(lowerQuery);

      const productMatch = inv.products.some((product) => {
        return (
          products
            .find((p) => p.id === product.productId)
            ?.productName?.toLowerCase()
            .includes(lowerQuery) ||
          product.model?.toLowerCase().includes(lowerQuery) ||
          product.make?.toLowerCase().includes(lowerQuery) ||
          product.serialNumber?.toLowerCase().includes(lowerQuery) ||
          product.macAddress?.toLowerCase().includes(lowerQuery) ||
          product.warrantyPeriod?.toLowerCase().includes(lowerQuery) ||
          product.purchaseRate?.toLowerCase().includes(lowerQuery)
        );
      });

      return inventoryMatch || productMatch;
    });

    setFilteredInventory(filtered);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate due date if purchaseDate and creditTerms are present
      const { purchaseDate, creditTerms } = updated;
      if (purchaseDate && creditTerms && !isNaN(Number(creditTerms))) {
        const date = new Date(purchaseDate);
        date.setDate(date.getDate() + parseInt(creditTerms));
        updated.dueDate = date.toISOString().split("T")[0]; // format as YYYY-MM-DD
      }

      // Auto-calculate Gross Amount Net Amount + GST Amount
      const netAmount = parseFloat(updated.invoiceNetAmount || "0") || 0;
      const gstAmount = parseFloat(updated.gstAmount || "0") || 0;
      updated.invoiceGrossAmount = (netAmount + gstAmount).toFixed(2);

      return updated;
    });
  };

  const handleSave = async () => {
    // Validation loop
    for (let i = 0; i < formData.products.length; i++) {
      const p = formData.products[i];
      const hasSerial = p.serialNumber && p.serialNumber.trim() !== "";
      const hasMac = p.macAddress && p.macAddress.trim() !== "";
      const isChecked = p.noSerialMac === true;

      if (!hasSerial && !hasMac && !isChecked) {
        setAlertMessage(
          `You must have Serial Number, MAC Address, or check the box for auto-generate.`
        );
        setAlertType("error");
        setTimeout(() => setAlertMessage(""), 3000);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        products: formData.products.map((product) => ({
          productId: product.productId,
          make: product.make,
          model: product.model,
          serialNumber: product.serialNumber,
          macAddress: product.macAddress,
          warrantyPeriod: product.warrantyPeriod,
          purchaseRate: product.purchaseRate,
          autoGenerateSerial: product.noSerialMac, // send to backend
        })),
      };

      if (formData.id) {
        await axios.put(`http://http://192.168.29.167:8000/inventory/${formData.id}`, payload);
        setAlertMessage("Inventory updated successfully!");
        setAlertType("success");
      } else {
        await axios.post("http://http://192.168.29.167:8000/inventory", payload);
        setAlertMessage("Inventory created successfully!");
        setAlertType("success");
      }

      setFormData(initialFormState);
      setIsModalOpen(false);
      fetchInventory();
      setTimeout(() => setAlertMessage(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setAlertMessage("Something went wrong!");
      setAlertType("error");
      setTimeout(() => setAlertMessage(""), 3000);
    }
  };

  const openModal = (data?: Inventory) => {
    if (data) {
      const clonedProducts = (data.products || []).map((p) => ({ ...p }));
      setFormData({ ...data, products: clonedProducts });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
            </div>
          </div>
          
          <div className="px-6 py-4">
            {/* Alert Message */}
            <AnimatePresence>
              {alertMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4"
                >
                  <Alert className={`${alertType === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
                    <AlertDescription className={`${alertType === "success" ? "text-green-800" : "text-red-800"}`}>
                      {alertMessage}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header with Add Button and Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
              <Button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Inventory
              </Button>
          </motion.div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Download className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Inventory Items
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                  {[
                    { label: "Product Name", key: "productName" },
                    { label: "Make", key: "make" },
                    { label: "Model", key: "model" },
                    { label: "Serial No", key: "serialNumber" },
                    { label: "MAC Address", key: "macAddress" },
                    { label: "Warranty Period(Days)", key: "warrantyPeriod" },
                    { label: "Purchase Rate", key: "purchaseRate" },
                    { label: "Purchased From", key: "vendor" },
                    { label: "Purchased Date", key: "purchaseDate" },
                    { label: "P.Invoice No", key: "purchaseInvoice" },
                    { label: "Status", key: "status" },
                    { label: "Age", key: "duration" },
                    { label: "Actions", key: "" },
                  ].map((col) => (
                    <TableHead
                      key={col.key}
                      className="text-center cursor-pointer select-none font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                      onClick={() => col.key && handleSort(col.key)}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>{col.label}</span>
                        {sortConfig?.key === col.key && (
                          <span className="text-indigo-600">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInventory.map((inv) =>
                  inv.products.map((product, index) => (
                    <TableRow
                      key={`${inv.id}-${product.serialNumber}-${index}`}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="text-center font-medium">
                        {products.find((p) => p.id === product.productId)
                          ?.productName || "N/A"}
                      </TableCell>
                      <TableCell className="text-center">{product.make}</TableCell>
                      <TableCell className="text-center">{product.model}</TableCell>
                      <TableCell className="text-center">
                        {product.serialNumber || "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.macAddress || "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.warrantyPeriod}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.purchaseRate}
                      </TableCell>
                      <TableCell className="text-center">
                        {vendors.find((v) => v.id === inv.vendorId)?.vendorName}
                      </TableCell>
                      <TableCell className="text-center">
                        {inv.purchaseDate?.slice(0, 10)}
                      </TableCell>
                      <TableCell className="text-center">{inv.purchaseInvoice}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          inv.status === "In Stock" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{inv.duration}</TableCell>
                      <TableCell className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(inv)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <PencilLine size={16} />
                          </Button>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Previous
        </Button>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
              className={`${
                currentPage === i + 1 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Next
        </Button>
      </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-800">
                    {formData.id ? "Edit Inventory" : "Add Inventory"}
                  </DialogTitle>
                  <DialogDescription>
                    {formData.id ? "Update inventory details" : "Add new inventory item"}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="purchaseInvoice">Purchase Invoice No</Label>
                        <Input
                          id="purchaseInvoice"
                          name="purchaseInvoice"
                          placeholder="Purchase Invoice No"
                          value={formData.purchaseInvoice}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchaseDate">Purchase Invoice Date</Label>
                        <Input
                          id="purchaseDate"
                          name="purchaseDate"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vendor Name</Label>
                        <SimpleVendorSelect
                          selectedValue={formData.vendorId}
                          onSelect={(val) =>
                            setFormData((prev) => ({ ...prev, vendorId: val }))
                          }
                          placeholder="Select Vendor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="creditTerms">Credit Terms</Label>
                        <Input
                          id="creditTerms"
                          name="creditTerms"
                          placeholder="Credit Terms"
                          value={formData.creditTerms}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invoiceNetAmount">Net Amount</Label>
                        <Input
                          id="invoiceNetAmount"
                          name="invoiceNetAmount"
                          placeholder="Net Amount"
                          value={formData.invoiceNetAmount}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gstAmount">GST Amount</Label>
                        <Input
                          id="gstAmount"
                          name="gstAmount"
                          placeholder="GST Amount"
                          value={formData.gstAmount}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invoiceGrossAmount">Gross Amount</Label>
                        <Input
                          id="invoiceGrossAmount"
                          name="invoiceGrossAmount"
                          placeholder="Gross Amount"
                          value={formData.invoiceGrossAmount}
                          onChange={handleChange}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Products</h3>
                    <div className="space-y-4">
                      {formData.products.map((product, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg relative bg-gradient-to-r from-gray-50 to-gray-100"
                        >
                          <div className="col-span-2 md:col-span-3 flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={product.noSerialMac || false}
                              onChange={(e) => {
                                const updated = [...formData.products];
                                updated[index].noSerialMac = e.target.checked;
                                setFormData({ ...formData, products: updated });
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Label className="text-sm font-medium text-gray-700">
                              Check if product does not have Serial or MAC
                            </Label>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Product</Label>
                            <SimpleProductSelect
                              selectedValue={product.productId}
                              onSelect={(value: number) =>
                                setFormData((prev) => {
                                  const updated = [...prev.products];
                                  updated[index].productId = value;
                                  return { ...prev, products: updated };
                                })
                              }
                              placeholder="Select Product"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Make</Label>
                            <Input
                              placeholder="Make"
                              value={product.make}
                              onChange={(e) => {
                                const updated = [...formData.products];
                                updated[index].make = e.target.value;
                                setFormData({ ...formData, products: updated });
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Model</Label>
                            <Input
                              placeholder="Model"
                              value={product.model}
                              onChange={(e) => {
                                const updated = [...formData.products];
                                updated[index].model = e.target.value;
                                setFormData({ ...formData, products: updated });
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Serial Number</Label>
                            <Input
                              placeholder="Serial Number"
                              value={product.serialNumber}
                              onChange={(e) => {
                                const updated = [...formData.products];
                                updated[index].serialNumber = e.target.value;
                                setFormData({ ...formData, products: updated });
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>MAC Address</Label>
                            <Input
                              placeholder="MAC Address"
                              value={product.macAddress}
                              onChange={(e) => {
                                const updated = [...formData.products];
                                updated[index].macAddress = e.target.value;
                                setFormData({ ...formData, products: updated });
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Warranty Period (Days)</Label>
                            <Input
                              placeholder="Warranty Period"
                              value={product.warrantyPeriod}
                              onChange={(e) => {
                                const updated = [...formData.products];
                                updated[index].warrantyPeriod = e.target.value;
                                setFormData({ ...formData, products: updated });
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Purchase Rate</Label>
                            <Input
                              placeholder="Purchase Rate"
                              value={product.purchaseRate}
                              onChange={(e) => {
                                const updated = [...formData.products];
                                updated[index].purchaseRate = e.target.value;
                                setFormData({ ...formData, products: updated });
                              }}
                            />
                          </div>
                          
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-2 right-2"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = [...formData.products];
                                updated.splice(index, 1);
                                setFormData({ ...formData, products: updated });
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              ✕
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              products: [
                                ...prev.products,
                                {
                                  productId: 0,
                                  make: "",
                                  model: "",
                                  serialNumber: "",
                                  macAddress: "",
                                  warrantyPeriod: "",
                                  purchaseRate: "",
                                },
                              ],
                            }))
                          }
                          className="w-full border-dashed border-2 border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Product
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                    >
                      Save Changes
                    </Button>
                  </motion.div>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default InventoryTable;
