"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SimpleCustomerSelect } from "@/components/ui/SimpleCustomerSelect";
import { SimpleVendorSelect } from "@/components/ui/SimpleVendorSelect";
import { SimpleSerialSelect } from "@/components/ui/SimpleSerialSelect";
import { SimpleMacAddressSelect } from "@/components/ui/SimpleMacAddressSelect";
import { SimpleProductSelect } from "@/components/ui/SimpleProductSelect";
import { SimpleSiteSelect } from "@/components/ui/SimpleSiteSelect";
import Papa from "papaparse";
import { PencilLine, Trash2, Search, Plus, Download, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface Vendor {
  id: number;
  vendorName: string;
}

interface Site {
  id: number;
  siteName: string;
  customerId: number;
}

interface Customer {
  id: number;
  customerName: string;
  Sites: Site[];
}

interface Product {
  id: number;
  productName: string;
}

interface InventoryItem {
  id: number;
  serialNumber: string;
  macAddress: string;
  productId: number;
  product: Product;
  vendorId: number;
  vendor: Vendor;
}

interface FormData {
  id?: number;
  deliveryType: string;
  refNumber?: string;
  salesOrderNo?: string;
  quotationNo?: string;
  purchaseInvoiceNo?: string;
  customerId?: number;
  siteId?: number | undefined;
  productId?: number;
  inventoryId?: number;
  vendorId?: number;
}

interface DeliveryItem {
  serialNumber: string;
  macAddress: string;
  productId: number;
  inventoryId?: number;
  productName?: string;
  vendorId?: number;
  customerId?: number;
  siteId?: number;
}

const initialFormData: FormData = {
  deliveryType: "",
  refNumber: "",
  salesOrderNo: "",
  quotationNo: "",
  purchaseInvoiceNo: "",
  customerId: 0,
  siteId: 0,
  vendorId: 0,
  productId: 0,
};

const MaterialDeliveryForm: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [items, setItems] = useState<DeliveryItem[]>([
    { serialNumber: "", macAddress: "", productId: 0 },
  ]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryList, setDeliveryList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const headers = [
    { label: "Delivery Type", key: "deliveryType" },
    { label: "Delivery Challan", key: "deliveryChallan" },
    { label: "Sales Order No", key: "salesOrderNo" },
    { label: "Quotation No", key: "quotationNo" },
    { label: "Purchase Invoice No", key: "purchaseInvoiceNo" },
    { label: "Ref Number", key: "refNumber" },
    { label: "Customer Name", key: "customerName" },
    { label: "Site Name", key: "siteName" },
    { label: "Vendor Name", key: "vendorName" },
    { label: "Serial Number", key: "serialNumber" },
    { label: "Product", key: "product" },
    { label: "MAC Address", key: "macAddress" },
    { label: "Actions", key: "actions" },
  ];

  const sortedDeliveries = React.useMemo(() => {
    if (!sortField) return deliveryList;

    return [...deliveryList].sort((a, b) => {
      let aField = a[sortField as keyof typeof a];
      let bField = b[sortField as keyof typeof b];

      // Handle undefined or null
      if (aField === undefined || aField === null) aField = "";
      if (bField === undefined || bField === null) bField = "";

      // Check if fields are dates — adjust if you have date columns
      if (
        sortField.toLowerCase().includes("date") ||
        sortField.toLowerCase().includes("challan")
      ) {
        const dateA = new Date(aField).getTime();
        const dateB = new Date(bField).getTime();
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
  }, [deliveryList, sortField, sortOrder]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = sortedDeliveries.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedDeliveries.length / itemsPerPage);

  const isSaleOrDemo =
    formData.deliveryType === "Sale" || formData.deliveryType === "Demo";
  const isPurchaseReturn = formData.deliveryType === "Purchase Return";

  useEffect(() => {
    axios
      .get("http://localhost:8000/customers")
      .then((res) => setCustomers(res.data));
    axios
      .get("http://localhost:8000/vendors")
      .then((res) => setVendors(res.data));
    axios
      .get("http://localhost:8000/products")
      .then((res) => setProducts(res.data));
    axios
      .get("http://localhost:8000/inventory")
      .then((res) => setInventory(res.data));
    fetchDeliveries(); // Fetch deliveries on component mount
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8000/inventory").then((res) => {
      console.log("Raw inventory response:", res.data); // ✅ log raw response

      const flattened = res.data.flatMap((inv: any) =>
        (inv.products || []).map((prod: any) => ({
          id: prod.id,
          serialNumber: prod.serialNumber,
          macAddress: prod.macAddress,
          productId: prod.productId,
          product: prod.product,
          vendorId: inv.vendorId,
        }))
      );

      setInventory(flattened);
      setInventoryList(flattened);
    });
  }, []);

  const fetchDeliveries = async () => {
    const res = await axios.get("http://localhost:8000/material-delivery");
    setDeliveryList(res.data.reverse());
  };

  useEffect(() => {
    const selectedCustomer = customers.find(
      (c) => c.id === formData.customerId
    );
    if (selectedCustomer) {
      setSites(selectedCustomer.Sites || []);
    } else {
      setSites([]);
    }
  }, [formData.customerId, customers]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "customerId" || name === "vendorId"
          ? parseInt(value)
          : name === "siteId" && value === ""
          ? undefined
          : value, // Allow undefined siteId
    }));
  };

  const handleDownloadCSV = () => {
    if (!deliveryList.length) return;

    // Flatten all sites from all customers
    const allSites: Site[] = customers.flatMap((c) => c.Sites || []);

    const csvData = deliveryList.map((delivery) => {
      const customerName =
        customers.find((c) => c.id === delivery.customerId)?.customerName ||
        "N/A";

      const siteName =
        allSites.find((s) => s.id === delivery.siteId)?.siteName || "N/A";

      const vendorName =
        vendors.find((v) => v.id === delivery.vendorId)?.vendorName || "N/A";

      const productDetails = (delivery.materialDeliveryItems || [])
        .map((item: any) => {
          const inventoryItem = inventory.find(
            (inv) => inv.id === item.inventoryId
          );

          const productName =
            products.find((p) => p.id === item.productId)?.productName ||
            inventoryItem?.product?.productName ||
            "N/A";

          const serial =
            inventoryItem?.serialNumber || item.serialNumber || "N/A";
          const mac = inventoryItem?.macAddress || item.macAddress || "N/A";

          return `${productName} (SN: ${serial}, MAC: ${mac})`;
        })
        .join("; ");

      return {
        DeliveryType: delivery.deliveryType || "N/A",
        RefNumber: delivery.refNumber ? `="${delivery.refNumber}"` : "N/A",
        SalesOrderNo: delivery.salesOrderNo
          ? `="${delivery.salesOrderNo}"`
          : "N/A",
        QuotationNo: delivery.quotationNo
          ? `="${delivery.quotationNo}"`
          : "N/A",
        PurchaseInvoiceNo: delivery.purchaseInvoiceNo
          ? `="${delivery.purchaseInvoiceNo}"`
          : "N/A",
        Customer: customerName,
        Site: siteName,
        Vendor: vendorName,
        Products: productDetails || "N/A",
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "material-deliveries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleItemChange = (
    index: number,
    field: keyof DeliveryItem,
    value: string
  ) => {
    const updatedItems = [...items];
    (updatedItems[index][field] as string) = value;

    // Auto-fill productId and inventoryId if serialNumber or macAddress is selected
    if (field === "serialNumber" || field === "macAddress") {
      const found = inventory.find(
        (inv) =>
          inv.serialNumber === updatedItems[index].serialNumber ||
          inv.macAddress === updatedItems[index].macAddress
      );

      if (found) {
        updatedItems[index].productId = found.productId;
        updatedItems[index].inventoryId = found.id;
        updatedItems[index].serialNumber = found.serialNumber;
        updatedItems[index].macAddress = found.macAddress;
        updatedItems[index].productName =
          found.product?.productName || "Unknown";
        updatedItems[index].vendorId = found.vendorId;
        updatedItems[index].customerId = formData.customerId || 0; // Set customerId from formData
        updatedItems[index].siteId = formData.siteId || 0; // Set siteId from formData
      }
    }

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { serialNumber: "", macAddress: "", productId: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const isEdit = !!formData.id;

    if (!formData.deliveryType) {
      setAlert({ type: "error", message: "Please select a delivery type" });
      return;
    }

    if (isSaleOrDemo && !formData.customerId) {
      setAlert({ type: "error", message: "Customer is required for Sale or Demo" });
      return;
    }
    if (isPurchaseReturn && !formData.vendorId) {
      setAlert({ type: "error", message: "Vendor is required for Purchase Return" });
      return;
    }

    // Map items array to include required fields
    const payload = {
      ...formData,
      customerId: isSaleOrDemo ? formData.customerId : undefined,
      siteId: formData.siteId ? formData.siteId : undefined, // Optional siteId
      vendorId: isPurchaseReturn ? formData.vendorId : undefined,
      materialDeliveryItems: items // Ensure this field includes all required item data
        .filter((item) => item.inventoryId) // Ensure items with inventoryId are included
        .map((item) => ({
          inventoryId: item.inventoryId,
          serialNumber: item.serialNumber, // Map serialNumber to serialNumber
          macAddress: item.macAddress, // Map macAddress properly
          productId: item.productId, // Ensure productId is mapped correctly
          productName: item.productName || "Unknown", // Default value for missing productName
        })),
    };

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:8000/material-delivery/${formData.id}`,
          payload
        );
        setAlert({ type: "success", message: "Delivery updated sucessfully!" });
      } else {
        await axios.post("http://localhost:8000/material-delivery", payload);
        setAlert({ type: "success", message: "Delivery created successfully!" });
      }

      // Reset form and table after successful submission
      setFormData(initialFormData);
      setItems([{ serialNumber: "", macAddress: "", productId: 0 }]);
      fetchDeliveries();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "Error saving delivery" });
    }
  };

  const openModal = (delivery?: any) => {
    if (delivery) {
      const enrichedItems = (delivery.materialDeliveryItems || []).map(
        (item: any) => {
          const inv = inventory.find((i) => i.id === item.inventoryId);

          return {
            inventoryId: item.inventoryId || 0,
            serialNumber: item.serialNumber || inv?.serialNumber || "",
            macAddress: item.macAddress || inv?.macAddress || "",
            productId: item.productId || inv?.productId || 0,
            productName: inv?.product?.productName || "Unknown",
            vendorId: delivery.vendorId || inv?.vendorId || undefined,
            customerId: delivery.customerId || undefined,
            siteId: delivery.siteId || undefined,
          };
        }
      );

      setFormData({
        id: delivery.id,
        deliveryType: delivery.deliveryType || "",
        refNumber: delivery.refNumber || "",
        salesOrderNo: delivery.salesOrderNo || "",
        quotationNo: delivery.quotationNo || "",
        purchaseInvoiceNo: delivery.purchaseInvoiceNo || "",
        customerId: delivery.customerId || 0,
        siteId: delivery.siteId || 0,
        vendorId: delivery.vendorId || 0,
      });

      setItems(
        enrichedItems.length
          ? enrichedItems
          : [{ serialNumber: "", macAddress: "", productId: 0 }]
      );
    } else {
      // Reset for new entry
      setFormData(initialFormData);
      setItems([{ serialNumber: "", macAddress: "", productId: 0 }]);
    }

    setIsModalOpen(true);
  };

  const handleDelete = (id: any): void => {
    if (confirm("Are you sure you want to delete this delivery?")) {
      axios
        .delete(`http://localhost:8000/material-delivery/${id}`)
        .then(() => {
          setAlert({ type: "success", message: "Delivery deleted!" });
          fetchDeliveries();
        })
        .catch((error) => {
          console.error(error);
          setAlert({ type: "error", message: "Error deleting delivery" });
        });
    }
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <>
      <div className="flex-1 p-6 overflow-auto">
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

        <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-5">
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Delivery
          </Button>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
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
              {currentDeliveries
                .filter((delivery) => {
                  const lowerSearch = search.toLowerCase();
                  return (
                    delivery.refNumber?.toLowerCase().includes(lowerSearch) ||
                    delivery.salesOrderNo
                      ?.toLowerCase()
                      .includes(lowerSearch) ||
                    delivery.quotationNo?.toLowerCase().includes(lowerSearch) ||
                    delivery.purchaseInvoiceNo
                      ?.toLowerCase()
                      .includes(lowerSearch) ||
                    delivery.deliveryChallan
                      ?.toLowerCase()
                      .includes(lowerSearch) ||
                    delivery.materialDeliveryItems
                      ?.map((item: any) => item.serialNumber)
                      .join(", ")
                      .toLowerCase()
                      .includes(lowerSearch) ||
                    delivery.deliveryType
                      ?.toLowerCase()
                      .includes(lowerSearch) ||
                    delivery.customer?.customerName
                      ?.toLowerCase()
                      .includes(lowerSearch) ||
                    delivery.vendor?.vendorName
                      ?.toLowerCase()
                      .includes(lowerSearch)
                  );
                })
                .map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.deliveryType}</TableCell>
                    <TableCell>
                      {delivery.deliveryChallan || "No Delivery Challan"}
                    </TableCell>
                    <TableCell>
                      {delivery.salesOrderNo || "No Sales Order No"}
                    </TableCell>
                    <TableCell>
                      {delivery.quotationNo || "No Quotation"}
                    </TableCell>
                    <TableCell>
                      {delivery.purchaseInvoiceNo || "No Invoice"}
                    </TableCell>
                    <TableCell>
                      {delivery.refNumber || "No Ref No"}
                    </TableCell>
                    <TableCell>
                      {delivery.customer?.customerName || "No Customer"}
                    </TableCell>
                    <TableCell>
                      {delivery.site?.siteName || "No Sites"}
                    </TableCell>
                    <TableCell>
                      {delivery.vendor?.vendorName || "No Vendor"}
                    </TableCell>
                    <TableCell>
                      {delivery.materialDeliveryItems
                        ?.map((item: any, idx: number) => item.serialNumber)
                        .join(", ") || "No Serial Number"}
                    </TableCell>
                    <TableCell>
                      {delivery.materialDeliveryItems
                        ?.map(
                          (item: any, idx: number) => item.product?.productName
                        )
                        .join(", ") || "N/A"}
                    </TableCell>
                    <TableCell>
                      {delivery.materialDeliveryItems
                        ?.map((item: any, idx: number) => item.macAddress)
                        .join(", ") || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal(delivery)}
                          className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-colors duration-200"
                        >
                          <PencilLine className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(delivery.id)}
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
                {formData.id ? "Edit Delivery" : "Add Delivery"}
              </DialogTitle>
            </DialogHeader>
            <MaterialDeliveryFormComponent
              formData={formData}
              setFormData={setFormData}
              items={items}
              setItems={setItems}
              isSaleOrDemo={isSaleOrDemo}
              isPurchaseReturn={isPurchaseReturn}
              customers={customers}
              vendors={vendors}
              sites={sites}
              inventory={inventory}
              products={products}
              handleChange={handleChange}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              handleSave={handleSave}
              setIsModalOpen={setIsModalOpen}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
const MaterialDeliveryFormComponent: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  items: DeliveryItem[];
  setItems: React.Dispatch<React.SetStateAction<DeliveryItem[]>>;
  isSaleOrDemo: boolean;
  isPurchaseReturn: boolean;
  customers: Customer[];
  vendors: Vendor[];
  sites: Site[];
  inventory: InventoryItem[];
  products: Product[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleItemChange: (index: number, field: keyof DeliveryItem, value: string) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  handleSave: () => void;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  formData,
  setFormData,
  items,
  isSaleOrDemo,
  isPurchaseReturn,
  sites,
  products,
  handleChange,
  handleItemChange,
  addItem,
  removeItem,
  handleSave,
  setIsModalOpen,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="deliveryType">Delivery Type</Label>
        <Select
          value={formData.deliveryType}
          onValueChange={(value) =>
            setFormData({ ...formData, deliveryType: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Delivery Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sale">Sale</SelectItem>
            <SelectItem value="Demo">Demo</SelectItem>
            <SelectItem value="Purchase Return">Purchase Return</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="refNumber">Reference Number</Label>
        <Input
          id="refNumber"
          name="refNumber"
          placeholder="Reference Number"
          value={formData.refNumber || ""}
          onChange={handleChange}
        />
      </div>

      {isSaleOrDemo && (
        <div className="space-y-2">
          <Label>Customer</Label>
          <SimpleCustomerSelect
            selectedValue={formData.customerId ?? 0}
            onSelect={(value) =>
              setFormData({ ...formData, customerId: value })
            }
            placeholder="Select Customer"
          />
        </div>
      )}

      {isSaleOrDemo && (
        <div className="space-y-2">
          <Label htmlFor="siteId">Site</Label>
          <Select
            value={formData.siteId?.toString() ?? ""}
            onValueChange={(value) =>
              setFormData({ ...formData, siteId: value ? parseInt(value) : undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Customer's Site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.siteName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isPurchaseReturn && (
        <div className="space-y-2">
          <Label>Vendor</Label>
          <SimpleVendorSelect
            selectedValue={formData.vendorId ?? 0}
            onSelect={(value) =>
              setFormData({ ...formData, vendorId: value })
            }
            placeholder="Select Vendor"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="salesOrderNo">Sales Order No</Label>
        <Input
          id="salesOrderNo"
          name="salesOrderNo"
          placeholder="Sales Order No"
          value={formData.salesOrderNo || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quotationNo">Quotation No</Label>
        <Input
          id="quotationNo"
          name="quotationNo"
          placeholder="Quotation No"
          value={formData.quotationNo || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchaseInvoiceNo">Purchase Invoice No</Label>
        <Input
          id="purchaseInvoiceNo"
          name="purchaseInvoiceNo"
          placeholder="Purchase Invoice No"
          value={formData.purchaseInvoiceNo || ""}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="space-y-4">
      <Label className="text-sm font-medium">Items</Label>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50"
        >
          <div className="space-y-2">
            <Label>Serial Number</Label>
            <SimpleSerialSelect
              selectedValue={item.serialNumber}
              onSelect={(serialNumber, macAddress, productName) => {
                handleItemChange(index, "serialNumber", serialNumber);
                if (macAddress) handleItemChange(index, "macAddress", macAddress);
                if (productName) handleItemChange(index, "productName", productName);
              }}
              placeholder="Select Serial Number"
            />
          </div>

          <div className="space-y-2">
            <Label>MAC Address</Label>
            <SimpleMacAddressSelect
              selectedValue={item.macAddress}
              onSelect={(macAddress, serialNumber, productName) => {
                handleItemChange(index, "macAddress", macAddress);
                if (serialNumber) handleItemChange(index, "serialNumber", serialNumber);
                if (productName) handleItemChange(index, "productName", productName);
              }}
              placeholder="Select MAC Address"
            />
          </div>

          <div className="space-y-2">
            <Label>Product Name</Label>
            <SimpleProductSelect
              selectedValue={item.productId}
              onSelect={(productId) => {
                handleItemChange(index, "productId", productId.toString());
                // Find the product name from the products list
                const product = products.find(p => p.id === productId);
                if (product) {
                  handleItemChange(index, "productName", product.productName);
                }
              }}
              placeholder="Select Product"
            />
          </div>

          <div className="flex items-end gap-2 col-span-full">
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            {items.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      ))}
     <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
      <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
        {formData.id ? "Update" : "Create"} Delivery
      </Button>
      </div>
    </div>
  </div>
);

export default MaterialDeliveryForm;
