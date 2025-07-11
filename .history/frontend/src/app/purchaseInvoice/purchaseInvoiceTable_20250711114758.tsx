"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilLine, Trash2, Search, Plus, Download } from "lucide-react";
import { SimpleVendorSelect } from "@/components/ui/SimpleVendorSelect";
import { SimpleProductSelect } from "@/components/ui/SimpleProductSelect";
import { SimpleSerialSelect } from "@/components/ui/SimpleSerialSelect";
import { SimpleMacAddressSelect } from "@/components/ui/SimpleMacAddressSelect";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface ProductInventory {
  productId: number;
  serialNumber: string;
  macAddress: string;
  warrantyPeriod: string;
  purchaseRate: string;
}

interface Inventory {
  id?: number;
  vendorId: number;
  creditTerms?: string;
  invoiceNetAmount?: string;
  gstAmount?: string;
  dueDate?: string;
  paidAmount?: string;
  dueAmount?: string;
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
  paidAmount: "0",
  dueAmount: "",
  creditTerms: "",
  invoiceNetAmount: "",
  gstAmount: "",
  invoiceGrossAmount: "",
  products: [],
};

const PurchaseInvoiceTable: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<Inventory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorPayments, setVendorPayments] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Inventory>(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const itemsPerPage = 10;

 const sortedInventory = React.useMemo(() => {
  if (!sortField) return filteredInventory;

  return [...filteredInventory].sort((a, b) => {
    let aField = a[sortField as keyof typeof a];
    let bField = b[sortField as keyof typeof b];

    // Handle undefined or null
    if (aField === undefined || aField === null) aField = "";
    if (bField === undefined || bField === null) bField = "";

    // If sorting by date (adjust keys if you want more precise detection)
    if (sortField.toLowerCase().includes("date")) {
      const dateA =
        typeof aField === "string" || typeof aField === "number"
          ? new Date(aField).getTime()
          : 0;
      const dateB =
        typeof bField === "string" || typeof bField === "number"
          ? new Date(bField).getTime()
          : 0;
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    // Numeric compare if numbers
    if (typeof aField === "number" && typeof bField === "number") {
      return sortOrder === "asc" ? aField - bField : bField - aField;
    }

    // String compare fallback
    return sortOrder === "asc"
      ? String(aField).localeCompare(String(bField))
      : String(bField).localeCompare(String(aField));
  });
}, [filteredInventory, sortField, sortOrder]);


const paginatedInventory = sortedInventory.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  useEffect(() => {
    fetchProducts();
    fetchData();
    fetchVendors();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [inventoryList, searchQuery]);

  useEffect(() => {
    fetchData();
    fetchProducts();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const fetchData = async () => {
    try {
      const [inventoryRes, paymentsRes] = await Promise.all([
        axios.get("http://http://192.168.29.167:8000/inventory"),
        axios.get("http://http://192.168.29.167:8000/vendor-payment"),
      ]);

      const vendorPaymentsData = paymentsRes.data || [];

      const inventoryWithDuration = inventoryRes.data.map((item: Inventory) => {
        const purchaseDate = new Date(item.purchaseDate);
        const today = new Date();
        const diffDays = Math.floor(
          (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const matchingPayments = vendorPaymentsData.filter(
          (vp: any) => vp.purchaseInvoiceNo === item.purchaseInvoice
        );

        let latestDueAmount = parseFloat(item.invoiceGrossAmount || "0");

        if (matchingPayments.length > 0) {
          matchingPayments.sort(
            (a: any, b: any) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          latestDueAmount = parseFloat(matchingPayments[0].balanceDue || "0");
        }

        const grossAmount = parseFloat(item.invoiceGrossAmount || "0");
        const paidAmount = (grossAmount - latestDueAmount).toFixed(2);

        return {
          ...item,
          duration: `${diffDays} day${diffDays !== 1 ? "s" : ""}`,
          dueAmount: latestDueAmount.toFixed(2),
          paidAmount: paidAmount,
        };
      });

      setVendorPayments(vendorPaymentsData);
      setInventoryList(inventoryWithDuration);
    } catch (error) {
      console.error("Failed to fetch inventory and vendor payments", error);
    }
  };

  const handleDownloadCSV = () => {
    if (filteredInventory.length === 0) return;

    const csvData = filteredInventory.map((inventory) => {
      const vendorName =
        vendors.find((v) => v.id === inventory.vendorId)?.vendorName || "";

      const productDetails = inventory.products
        .map((product) => {
          const productName =
            products.find((p) => p.id === product.productId)?.productName || "";
          return `${productName} (SN: ${product.serialNumber})`;
        })
        .join("; ");

      return {
        PurchaseDate: inventory.purchaseDate,
        PurchaseInvoice: inventory.purchaseInvoice,
        Vendor: vendorName,
        Status: inventory.status || "",
        CreditTerms: inventory.creditTerms || "",
        DueDate: inventory.dueDate || "",
        InvoiceNetAmount: inventory.invoiceNetAmount || "",
        GSTAmount: inventory.gstAmount || "",
        InvoiceGrossAmount: inventory.invoiceGrossAmount || "",
        PaidAmount: inventory.paidAmount || "",
        DueAmount: inventory.dueAmount || "",
        Duration: inventory.duration || "",
        Products: productDetails,
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "purchase-invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchProducts = async () => {
    const res = await axios.get("http://http://192.168.29.167:8000/products");
    setProducts(res.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get("http://http://192.168.29.167:8000/vendors");
    setVendors(res.data);
  };

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();

    const filtered = inventoryList.filter((inv) => {
      const vendorName =
        vendors.find((v) => v.id === inv.vendorId)?.vendorName?.toLowerCase() ||
        "";

      const inventoryMatch =
        inv.purchaseInvoice?.toLowerCase().includes(lowerQuery) ||
        inv.purchaseDate?.toLowerCase().includes(lowerQuery) ||
        inv.creditTerms?.toLowerCase().includes(lowerQuery) ||
        inv.invoiceNetAmount?.toLowerCase().includes(lowerQuery) ||
        inv.gstAmount?.toLowerCase().includes(lowerQuery) ||
        inv.invoiceGrossAmount?.toLowerCase().includes(lowerQuery) ||
        inv.status?.toLowerCase().includes(lowerQuery) ||
        vendorName.includes(lowerQuery);

      const productMatch = inv.products.some((product) => {
        return (
          product.serialNumber?.toLowerCase().includes(lowerQuery) ||
          product.macAddress?.toLowerCase().includes(lowerQuery) ||
          product.warrantyPeriod?.toLowerCase().includes(lowerQuery) ||
          product.purchaseRate?.toLowerCase().includes(lowerQuery)
        );
      });

      return inventoryMatch || productMatch;
    });

    // ✅ Deduplicate based on purchaseInvoice
    const uniqueMap = new Map();
    filtered.forEach((item) => {
      if (!uniqueMap.has(item.purchaseInvoice)) {
        uniqueMap.set(item.purchaseInvoice, item);
      }
    });

    setFilteredInventory(Array.from(uniqueMap.values()));
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

      const gross = parseFloat(updated.invoiceGrossAmount || "0");
      const paid = parseFloat(updated.paidAmount || "0");
      updated.dueAmount = (gross - paid).toFixed(2);

      return updated;
    });
  };

  const handleSave = async () => {
    if (!formData.purchaseInvoice || !formData.purchaseDate) {
      setAlert({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    try {
      const payload = {
        ...formData,
        products: formData.products.map((product) => ({
          productId: product.productId,
          serialNumber: product.serialNumber,
          macAddress: product.macAddress,
          warrantyPeriod: product.warrantyPeriod,
          purchaseRate: product.purchaseRate,
        })),
      };

      if (formData.id) {
        await axios.put(
          `http://http://192.168.29.167:8000/inventory/${formData.id}`,
          payload
        );
        setAlert({ type: "success", message: "Inventory updated!" });
      } else {
        await axios.post("http://http://192.168.29.167:8000/inventory", payload);
        setAlert({ type: "success", message: "Inventory created!" });
      }

      setFormData(initialFormState);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save error:", err);
      setAlert({ type: "error", message: "Something went wrong!" });
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("Delete this inventory item?")) return;
    await axios.delete(`http://http://192.168.29.167:8000/inventory/${id}`);
    fetchData();
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

  const headers = [
  { label: "Purchased Date", key: "purchaseDate" },
  { label: "P.Invoice No", key: "purchaseInvoice" },
  { label: "Purchased From", key: "vendorName" },  // adjust if you have vendorName instead of vendorId
  { label: "Invoice Amount", key: "invoiceAmount" },
  { label: "GST Amount", key: "gstAmount" },
  { label: "Gross Amount", key: "grossAmount" },
  { label: "Credit Terms", key: "creditTerms" },
  { label: "Due Date", key: "dueDate" },
  { label: "Paid Amount", key: "paidAmount" },
  { label: "Due Amount", key: "dueAmount" },
  { label: "Status", key: "status" },
  { label: "Age", key: "age" },
  { label: "Actions", key: "actions" },  // usually no sorting on actions
];


  return (
    <div className="flex-1 p-4">
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="mb-4"
          >
            <Alert variant={alert.type === "error" ? "destructive" : "default"}>
              {alert.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Purchase Invoice
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadCSV}
            title="Download CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-md border"
      >
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map(({ label, key }) => (
                <TableHead
                  key={key}
                  className={key !== "actions" ? "cursor-pointer select-none" : ""}
                  onClick={() => {
                    if (key === "actions") return;
                    if (sortField === key) {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortField(key);
                      setSortOrder("asc");
                    }
                    setCurrentPage(1);
                  }}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{label}</span>
                    {key !== "actions" && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`h-3 w-3 ${
                            sortField === key && sortOrder === "asc"
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 ${
                            sortField === key && sortOrder === "desc"
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInventory.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="text-center">
                  {inv.purchaseDate?.slice(0, 10)}
                </TableCell>
                <TableCell className="text-center">
                  {inv.purchaseInvoice}
                </TableCell>
                <TableCell className="text-center">
                  {vendors.find((v) => v.id === inv.vendorId)?.vendorName}
                </TableCell>
                <TableCell className="text-center">
                  {inv.invoiceNetAmount}
                </TableCell>
                <TableCell className="text-center">{inv.gstAmount}</TableCell>
                <TableCell className="text-center">
                  {inv.invoiceGrossAmount}
                </TableCell>
                <TableCell className="text-center">{inv.creditTerms}</TableCell>
                <TableCell className="text-center">
                  {inv.dueDate?.slice(0, 10)}
                </TableCell>
                <TableCell className="text-center">
                  {inv.paidAmount || "0"}
                </TableCell>
                <TableCell className="text-center">{inv.dueAmount}</TableCell>
                <TableCell className="text-center">
                  {parseFloat(inv.dueAmount || "0") === 0
                    ? "Full Paid"
                    : parseFloat(inv.dueAmount || "0") ===
                      parseFloat(inv.invoiceGrossAmount || "0")
                    ? "Unpaid"
                    : "Partly Paid"}
                </TableCell>
                <TableCell className="text-center">{inv.duration}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(inv)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(inv.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <div className="flex justify-center mt-4 gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i + 1}
            variant={currentPage === i + 1 ? "default" : "outline"}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {formData.id ? "Edit Inventory" : "Add Inventory"}
            </DialogTitle>
          </DialogHeader>
          <PurchaseInvoiceForm
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            handleSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
const PurchaseInvoiceForm: React.FC<{
  formData: Inventory;
  setFormData: React.Dispatch<React.SetStateAction<Inventory>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSave: () => void;
  onCancel: () => void;
}> = ({ formData, setFormData, handleChange, handleSave, onCancel }) => (
  <div className="space-y-4">
    {/* Inventory Section */}
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
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vendorId">Vendor Name</Label>
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
          type="date"
          name="dueDate"
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
        />
      </div>
    </div>

    {/* Products Section */}
    <div className="space-y-4">
      <Label className="text-sm font-medium">Products</Label>
      {formData.products.map((product, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50 relative"
        >
          <div className="space-y-2">
            <Label>Product</Label>
            <SimpleProductSelect
              selectedValue={product.productId}
              onSelect={(value) =>
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
            <Label>Serial Number</Label>
            <SimpleSerialSelect
              selectedValue={product.serialNumber}
              onSelect={(serialNumber) => {
                const updated = [...formData.products];
                updated[index].serialNumber = serialNumber;
                setFormData({ ...formData, products: updated });
              }}
              placeholder="Select Serial Number"
            />
          </div>
          <div className="space-y-2">
            <Label>MAC Address</Label>
            <SimpleMacAddressSelect
              selectedValue={product.macAddress}
              onSelect={(macAddress) => {
                const updated = [...formData.products];
                updated[index].macAddress = macAddress;
                setFormData({ ...formData, products: updated });
              }}
              placeholder="Select MAC Address"
            />
          </div>
          <div className="space-y-2">
            <Label>Warranty Period (Days)</Label>
            <Input
              type="text"
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
              type="text"
              placeholder="Purchase Rate"
              value={product.purchaseRate}
              onChange={(e) => {
                const updated = [...formData.products];
                updated[index].purchaseRate = e.target.value;
                setFormData({ ...formData, products: updated });
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              const updated = [...formData.products];
              updated.splice(index, 1);
              setFormData({ ...formData, products: updated });
            }}
            className="absolute top-2 right-2"
            title="Remove product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </motion.div>
      ))}

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
                serialNumber: "",
                macAddress: "",
                warrantyPeriod: "",
                purchaseRate: "",
              },
            ],
          }))
        }
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Product
      </Button>
    </div>

    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
        Save Inventory
      </Button>
    </div>
  </div>
);

export default PurchaseInvoiceTable;
