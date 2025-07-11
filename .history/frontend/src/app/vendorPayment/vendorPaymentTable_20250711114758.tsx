"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilLine, Trash, Download, Search, ChevronUp, ChevronDown } from "lucide-react";
import { SimpleVendorSelect } from "@/components/ui/SimpleVendorSelect";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Vendor {
  id: number;
  vendorName: string;
}

interface VendorPayment {
  id?: number;
  vendorId: number;
  purchaseInvoiceNo: string;
  invoiceGrossAmount: string;
  dueAmount: string;
  paidAmount: string;
  balanceDue?: string;
  paymentDate: string;
  referenceNo: string;
  paymentType: string;
  remark: string;
  createdAt?: string;
  updatedAt?: string;
}

const initialFormState: VendorPayment = {
  vendorId: 0,
  purchaseInvoiceNo: "",
  invoiceGrossAmount: "",
  dueAmount: "",
  paidAmount: "",
  balanceDue: "",
  paymentType: "",
  referenceNo: "",
  remark: "",
  paymentDate: "",
  createdAt: "",
  updatedAt: "",
};

const VendorPaymentTable: React.FC = () => {
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorInvoices, setVendorInvoices] = useState<any[]>([]);
  const [formData, setFormData] = useState<VendorPayment>(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const itemsPerPage = 10;

  const headers = [
    { label: "Entry Date", key: "entryDate" },
    { label: "Vendor", key: "vendorName" }, // special handling below
    { label: "Payment Date", key: "paymentDate" },
    { label: "Reference", key: "referenceNo" },
    { label: "Gross Amount", key: "invoiceGrossAmount" },
    { label: "Due Amount", key: "dueAmount" },
    { label: "Paid Amount", key: "paidAmount" },
    { label: "Balance Due", key: "balanceDue" },
    { label: "Payment Mode", key: "paymentType" },
    { label: "Remarks", key: "remark" },
    { label: "Purchase Invoice", key: "purchaseInvoiceNo" },
    { label: "Actions", key: "actions" },
  ];

  const filtered = payments.filter((p) => {
    const vendorName =
      vendors.find((v) => v.id === p.vendorId)?.vendorName.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return (
      vendorName.includes(q) ||
      p.paymentDate.toLowerCase().includes(q) ||
      p.referenceNo.toLowerCase().includes(q) ||
      p.paymentType.toLowerCase().includes(q) ||
      p.remark.toLowerCase().includes(q) ||
      p.purchaseInvoiceNo.toLowerCase().includes(q) ||
      p.invoiceGrossAmount.toLowerCase().includes(q) ||
      p.dueAmount.toLowerCase().includes(q)
    );
  });

  const sortedPayments = React.useMemo(() => {
    if (!sortField) return filtered;

    return [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "vendorName") {
        aValue = vendors.find((v) => v.id === a.vendorId)?.vendorName || "";
        bValue = vendors.find((v) => v.id === b.vendorId)?.vendorName || "";
      } else {
        aValue = a[sortField as keyof VendorPayment] ?? "";
        bValue = b[sortField as keyof VendorPayment] ?? "";
      }

      // Date fields handling (simple ISO or Date strings)
      if (sortField.toLowerCase().includes("date")) {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Numeric fields: convert to number if possible
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return sortOrder === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      // String comparison fallback
      return sortOrder === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filtered, sortField, sortOrder, vendors]);

  const paginated = sortedPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);

  useEffect(() => {
    fetchPayments();
    fetchVendors();
  }, []);

  const fetchPayments = async () => {
    const res = await axios.get("http://http://192.168.29.167:8000/vendor-payment");
    setPayments(res.data.reverse());
  };

  const fetchVendors = async () => {
    const res = await axios.get("http://http://192.168.29.167:8000/vendors");
    setVendors(res.data);
  };

  const handleDownloadCSV = () => {
    if (!payments.length) return;

    const csvData = payments.map((payment) => {
      const vendorName =
        vendors.find((v) => v.id === payment.vendorId)?.vendorName || "N/A";

      return {
        Vendor: vendorName,
        PurchaseInvoiceNo: payment.purchaseInvoiceNo
          ? `="${payment.purchaseInvoiceNo}"`
          : "N/A",
        InvoiceGrossAmount: payment.invoiceGrossAmount || "N/A",
        DueAmount: payment.dueAmount || "N/A",
        PaidAmount: payment.paidAmount || "N/A",
        BalanceDue: payment.balanceDue || "N/A",
        PaymentDate: payment.paymentDate || "N/A",
        ReferenceNo: payment.referenceNo ? `="${payment.referenceNo}"` : "N/A",
        PaymentType: payment.paymentType || "N/A",
        Remark: payment.remark || "N/A",
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "vendor-payments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // If the field being updated is 'paidAmount', calculate balanceDue
    if (name === "paidAmount") {
      const paid = parseFloat(value || "0");
      const due = parseFloat(formData.dueAmount || "0");
      const balance = due - paid;

      setFormData((prev) => ({
        ...prev,
        paidAmount: value,
        balanceDue: balance.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      if (formData.id) {
        await axios.put(
          `http://http://192.168.29.167:8000/vendor-payment/${formData.id}`,
          formData
        );
        setAlertMessage("Payment updated successfully!");
        setAlertType("success");
      } else {
        await axios.post("http://http://192.168.29.167:8000/vendor-payment", formData);
        setAlertMessage("Payment added successfully!");
        setAlertType("success");
      }
      setFormData(initialFormState);
      setIsModalOpen(false);
      fetchPayments();
      setTimeout(() => setAlertMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setAlertMessage("Please fill all mandatory fields");
      setAlertType("error");
      setTimeout(() => setAlertMessage(""), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );
    if (confirmed) {
      try {
        await axios.delete(`http://http://192.168.29.167:8000/vendor-payment/${id}`);
        setAlertMessage("Payment deleted successfully!");
        setAlertType("success");
        fetchPayments();
        setTimeout(() => setAlertMessage(""), 3000);
      } catch (err) {
        console.error(err);
        setAlertMessage("Error deleting payment");
        setAlertType("error");
        setTimeout(() => setAlertMessage(""), 3000);
      }
    }
  };

  const openModal = (data?: VendorPayment) => {
    if (data) setFormData(data);
    else setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // VendorPaymentForm component
  const VendorPaymentForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor</Label>
          <SimpleVendorSelect
            selectedValue={formData.vendorId}
            onSelect={async (val) => {
              setFormData((prev) => ({ ...prev, vendorId: val }));
              try {
                const res = await axios.get(
                  `http://http://192.168.29.167:8000/inventory?vendorId=${val}`
                );
                if (res.data && res.data.length > 0) {
                  setVendorInvoices(res.data);

                  const firstInvoice = res.data[0];
                  const invoiceNo = firstInvoice.purchaseInvoice;
                  const invoiceGrossAmount = parseFloat(
                    firstInvoice.invoiceGrossAmount || "0"
                  );

                  // Find previous payments for this invoice
                  const previousPayments = payments.filter(
                    (p) => p.purchaseInvoiceNo === invoiceNo
                  );

                  const totalPaid = previousPayments.reduce(
                    (sum, p) => sum + parseFloat(p.paidAmount || "0"),
                    0
                  );

                  const dueAmount = invoiceGrossAmount - totalPaid;

                  setFormData((prev) => ({
                    ...prev,
                    purchaseInvoiceNo: invoiceNo,
                    invoiceGrossAmount: firstInvoice.invoiceGrossAmount,
                    dueAmount: dueAmount.toFixed(2),
                  }));
                } else {
                  setVendorInvoices([]);
                  setFormData((prev) => ({
                    ...prev,
                    purchaseInvoiceNo: "",
                    invoiceGrossAmount: "",
                    dueAmount: "",
                  }));
                }
              } catch (err) {
                console.error("Failed to fetch inventory", err);
                setVendorInvoices([]);
                setFormData((prev) => ({
                  ...prev,
                  purchaseInvoiceNo: "",
                  invoiceGrossAmount: "",
                  dueAmount: "",
                }));
              }
            }}
            placeholder="Select Vendor"
          />
        </div>

        {vendorInvoices.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="invoice">Select Invoice</Label>
            <Select
              value={formData.purchaseInvoiceNo}
              onValueChange={(value) => {
                const selectedInvoiceNo = value;
                const selectedInvoice = vendorInvoices.find(
                  (inv) => inv.purchaseInvoice === selectedInvoiceNo
                );
                if (selectedInvoice) {
                  const invoiceGrossAmount = parseFloat(
                    selectedInvoice.invoiceGrossAmount || "0"
                  );
                  const previousPayments = payments.filter(
                    (p) => p.purchaseInvoiceNo === selectedInvoiceNo
                  );
                  const totalPaid = previousPayments.reduce(
                    (sum, p) => sum + parseFloat(p.paidAmount || "0"),
                    0
                  );
                  const dueAmount = invoiceGrossAmount - totalPaid;

                  setFormData((prev) => ({
                    ...prev,
                    purchaseInvoiceNo: selectedInvoiceNo,
                    invoiceGrossAmount: selectedInvoice.invoiceGrossAmount,
                    dueAmount: dueAmount.toFixed(2),
                  }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Invoice" />
              </SelectTrigger>
              <SelectContent>
                {vendorInvoices.map((inv, idx) => (
                  <SelectItem key={idx} value={inv.purchaseInvoice}>
                    {inv.purchaseInvoice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="invoiceGrossAmount">Invoice Gross Amount</Label>
          <Input
            id="invoiceGrossAmount"
            name="invoiceGrossAmount"
            value={formData.invoiceGrossAmount}
            onChange={handleChange}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueAmount">Due Amount</Label>
          <Input
            id="dueAmount"
            name="dueAmount"
            value={formData.dueAmount}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentDate">Payment Date</Label>
          <Input
            id="paymentDate"
            name="paymentDate"
            type="date"
            value={formData.paymentDate}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentType">Payment Type</Label>
          <Select
            value={formData.paymentType}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Payment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
              <SelectItem value="Credit Note">Credit Note</SelectItem>
              <SelectItem value="Write Off">Write Off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paidAmount">Paid Amount</Label>
          <Input
            id="paidAmount"
            name="paidAmount"
            value={formData.paidAmount}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referenceNo">Reference</Label>
          <Input
            id="referenceNo"
            name="referenceNo"
            value={formData.referenceNo}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="balanceDue">Balance Due</Label>
          <Input
            id="balanceDue"
            name="balanceDue"
            value={formData.balanceDue}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="remark">Remark</Label>
          <Input
            id="remark"
            name="remark"
            value={formData.remark}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Save
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => openModal()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {formData.id ? "Edit Payment" : "Add Payment"}
                  </DialogTitle>
                </DialogHeader>
                <VendorPaymentForm />
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={handleDownloadCSV}
                variant="outline"
                className="text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {alertMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-4 rounded-lg text-white ${
                alertType === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {alertMessage}
            </motion.div>
          )}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {headers.map(({ label, key }) => (
                    <TableHead
                      key={key}
                      className={`px-4 py-3 font-semibold text-gray-700 ${
                        key !== "actions" ? "cursor-pointer hover:bg-gray-100" : ""
                      }`}
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
                      <div className="flex items-center justify-between">
                        <span>{label}</span>
                        {key !== "actions" && (
                          <div className="flex flex-col ml-2">
                            <ChevronUp
                              className={`w-3 h-3 ${
                                sortField === key && sortOrder === "asc"
                                  ? "text-blue-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <ChevronDown
                              className={`w-3 h-3 -mt-1 ${
                                sortField === key && sortOrder === "desc"
                                  ? "text-blue-600"
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
                {paginated.map((p, index) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-4 py-3 text-center">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {vendors.find((v) => v.id === p.vendorId)?.vendorName ||
                        "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {new Date(p.paymentDate).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {p.referenceNo || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {p.invoiceGrossAmount}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">{p.dueAmount}</TableCell>
                    <TableCell className="px-4 py-3 text-center">{p.paidAmount}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {p.balanceDue || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">{p.paymentType}</TableCell>
                    <TableCell className="px-4 py-3 text-center">{p.remark || "N/A"}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {p.purchaseInvoiceNo}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(p)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-8 w-8"
                        >
                          <PencilLine className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id!)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-8 w-8"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedPayments.length)} of{" "}
              {sortedPayments.length} payments
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="px-3 py-1"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="px-3 py-1"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="px-3 py-1"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorPaymentTable;
