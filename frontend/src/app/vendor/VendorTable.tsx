"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, Building } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface VendorContact {
  title: string;
  firstName: string;
  lastName: string;
  contactPhoneNumber: string;
  contactEmailId: string;
  designation: string;
  department: string;
  landlineNumber: string;
}

interface BankDetail {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
}

interface Vendor {
  id?: number;
  vendorCode?: string;
  vendorName: string;
  registerAddress: string;
  gstNo: string;
  businessType?: string;
  state: string;
  city: string;
  emailId: string;
  gstpdf?: string;
  website: string;
  products: string[];
  creditTerms: string;
  creditLimit: string;
  remark: string;
  contacts: VendorContact[];
  bankDetails: BankDetail[];
}

const emptyContact: VendorContact = {
  title: "",
  firstName: "",
  lastName: "",
  contactPhoneNumber: "",
  contactEmailId: "",
  designation: "",
  department: "",
  landlineNumber: "",
};

const emptyBank: BankDetail = {
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branchName: "",
};

const initialFormState: Vendor = {
  vendorName: "",
  registerAddress: "",
  gstNo: "",
  businessType: "",
  state: "",
  city: "",
  emailId: "",
  gstpdf: "",
  website: "",
  products: [],
  creditTerms: "",
  creditLimit: "",
  remark: "",
  contacts: [emptyContact],
  bankDetails: [emptyBank],
};

const VendorTable: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [gstPdfFile, setGstPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Vendor>(initialFormState);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const itemsPerPage = 5;

  const fetchVendors = async () => {
    const response = await axios.get("http://localhost:8000/vendors");
    setVendors(response.data.reverse());
  };

  const filteredVendors = vendors.filter((vendor) =>
    [
      vendor.vendorName,
      vendor.vendorCode,
      vendor.products,
      vendor.gstNo,
      vendor.state,
      vendor.businessType,
    ].some(
      (field) =>
        typeof field === "string" &&
        field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/category");
      const names = response.data.map((c: any) => c.categoryName);
      setCategories(names);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    _field: string,
    index?: number,
    type?: string
  ) => {
    const { name, value } = e.target;

    if (type === "contact" && index !== undefined) {
      const updated = [...formData.contacts];
      updated[index][name as keyof VendorContact] = value;
      setFormData((prev) => ({ ...prev, contacts: updated }));
    } else if (type === "bank" && index !== undefined) {
      const updated = [...formData.bankDetails];
      updated[index][name as keyof BankDetail] = value;
      setFormData((prev) => ({ ...prev, bankDetails: updated }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addContact = () =>
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, emptyContact],
    }));

  const removeContact = (index: number) => {
    const updated = [...formData.contacts];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, contacts: updated }));
  };

  const addBank = () =>
    setFormData((prev) => ({
      ...prev,
      bankDetails: [...prev.bankDetails, emptyBank],
    }));

  const removeBank = (index: number) => {
    const updated = [...formData.bankDetails];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, bankDetails: updated }));
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData(vendor);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    const confirm = window.confirm(
      "Are you sure you want to delete this vendor?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:8000/vendors/${id}`);
      setAlert({ type: 'success', message: 'Vendor deleted successfully!' });
      fetchVendors();
    } catch (err) {
      console.error("Error deleting vendor:", err);
      setAlert({ type: 'error', message: 'Failed to delete vendor.' });
    }
  };

 const handleCreate = async () => {
  // ✅ Validate required fields
  const requiredFields = [
    "vendorName",
    "registerAddress",
    "gstNo",
    "state",
    "city",
    "emailId",
    "creditTerms",
    "creditLimit",
  ];

  const missingFields = requiredFields.filter(
    (field) => !formData[field as keyof Vendor]?.toString().trim()
  );

  if (missingFields.length > 0) {
    setAlert({ type: 'error', message: `Please fill out the following fields: ${missingFields.join(", ")}` });
    return;
  }

  // ✅ Validate contacts
  const validContacts = formData.contacts.filter(
    (c) =>
      c.firstName.trim() || c.lastName.trim() || c.contactPhoneNumber.trim()
  );
  if (validContacts.length === 0) {
    setAlert({ type: 'error', message: 'Please add at least one valid contact.' });
    return;
  }

  // ✅ Validate bank details
  const validBanks = formData.bankDetails.filter(
    (b) => b.accountNumber.trim() || b.ifscCode.trim() || b.bankName.trim()
  );

  try {
    // ✅ Construct FormData for both create and update
    const payload = new FormData();

    payload.append("vendorName", formData.vendorName);
    payload.append("registerAddress", formData.registerAddress);
    payload.append("gstNo", formData.gstNo);
    payload.append("businessType", formData.businessType || "");
    payload.append("state", formData.state);
    payload.append("city", formData.city);
    payload.append("emailId", formData.emailId);
    payload.append("website", formData.website);
    payload.append("creditTerms", formData.creditTerms);
    payload.append("creditLimit", formData.creditLimit);
    payload.append("remark", formData.remark);
    payload.append("products", JSON.stringify(formData.products));
    payload.append("contacts", JSON.stringify(validContacts));
    payload.append("bankDetails", JSON.stringify(validBanks));

    if (gstPdfFile) {
      payload.append("gstCertificate", gstPdfFile);
    }

    // ✅ Choose endpoint based on whether it's create or update
    if (formData.id) {
      await axios.put(`http://localhost:8000/vendors/${formData.id}`, payload);
      setAlert({ type: 'success', message: 'Vendor updated successfully!' });
    } else {
      await axios.post("http://localhost:8000/vendors", payload);
      setAlert({ type: 'success', message: 'Vendor created successfully!' });
    }

    // ✅ Success feedback
    setFormData(initialFormState);
    setGstPdfFile(null); // Reset file
    setIsCreateModalOpen(false);
    fetchVendors();
  } catch (err) {
    console.error("Error saving vendor:", err);
    setAlert({ type: 'error', message: 'Failed to save vendor. Please try again.' });
  }
};

  return (
    <div className="flex-1 p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">Vendor Management</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setFormData(initialFormState);
                        setAlert(null);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-800">
                        {formData.id ? "Edit Vendor" : "Create Vendor"}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="businessType" className="text-sm font-medium text-gray-700">
                          Business Type
                        </Label>
                        <Select
                          value={formData.businessType}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select Business Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OEM">OEM</SelectItem>
                            <SelectItem value="ND">ND</SelectItem>
                            <SelectItem value="RD">RD</SelectItem>
                            <SelectItem value="Stockist">Stockist</SelectItem>
                            <SelectItem value="Reseller">Reseller</SelectItem>
                            <SelectItem value="System Integrator">System Integrator</SelectItem>
                            <SelectItem value="Service Provider">Service Provider</SelectItem>
                            <SelectItem value="Consultant">Consultant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vendorName" className="text-sm font-medium text-gray-700">
                            Vendor Name
                          </Label>
                          <Input
                            id="vendorName"
                            name="vendorName"
                            type="text"
                            placeholder="Enter vendor name"
                            value={formData.vendorName}
                            onChange={(e) => handleInputChange(e, "vendorName")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="registerAddress" className="text-sm font-medium text-gray-700">
                            Register Address
                          </Label>
                          <Input
                            id="registerAddress"
                            name="registerAddress"
                            type="text"
                            placeholder="Enter register address"
                            value={formData.registerAddress}
                            onChange={(e) => handleInputChange(e, "registerAddress")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gstNo" className="text-sm font-medium text-gray-700">
                            GST No
                          </Label>
                          <Input
                            id="gstNo"
                            name="gstNo"
                            type="text"
                            placeholder="Enter GST number"
                            value={formData.gstNo}
                            onChange={(e) => handleInputChange(e, "gstNo")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                            State
                          </Label>
                          <Input
                            id="state"
                            name="state"
                            type="text"
                            placeholder="Enter state"
                            value={formData.state}
                            onChange={(e) => handleInputChange(e, "state")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                            City
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={(e) => handleInputChange(e, "city")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emailId" className="text-sm font-medium text-gray-700">
                            Email ID
                          </Label>
                          <Input
                            id="emailId"
                            name="emailId"
                            type="email"
                            placeholder="Enter email ID"
                            value={formData.emailId}
                            onChange={(e) => handleInputChange(e, "emailId")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                            Website
                          </Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            placeholder="Enter website"
                            value={formData.website}
                            onChange={(e) => handleInputChange(e, "website")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="creditTerms" className="text-sm font-medium text-gray-700">
                            Credit Terms
                          </Label>
                          <Input
                            id="creditTerms"
                            name="creditTerms"
                            type="text"
                            placeholder="Enter credit terms"
                            value={formData.creditTerms}
                            onChange={(e) => handleInputChange(e, "creditTerms")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="creditLimit" className="text-sm font-medium text-gray-700">
                            Credit Limit
                          </Label>
                          <Input
                            id="creditLimit"
                            name="creditLimit"
                            type="text"
                            placeholder="Enter credit limit"
                            value={formData.creditLimit}
                            onChange={(e) => handleInputChange(e, "creditLimit")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="remark" className="text-sm font-medium text-gray-700">
                            Remark
                          </Label>
                          <Input
                            id="remark"
                            name="remark"
                            type="text"
                            placeholder="Enter remarks"
                            value={formData.remark}
                            onChange={(e) => handleInputChange(e, "remark")}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gstCertificate" className="text-sm font-medium text-gray-700">
                          GST Certificate (PDF)
                        </Label>
                        <Input
                          id="gstCertificate"
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.type === "application/pdf") {
                              setGstPdfFile(file);
                            } else {
                              setAlert({ type: 'error', message: 'Please upload a valid PDF file.' });
                            }
                          }}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {gstPdfFile && (
                          <p className="text-sm text-green-600 mt-1">{gstPdfFile.name}</p>
                        )}
                        {!gstPdfFile && formData.gstpdf && (
                          <a
                            href={`http://localhost:8000/gst/${formData.gstpdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm mt-1 block transition-colors duration-200"
                          >
                            View existing GST certificate
                          </a>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Product Category
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 border border-gray-300 rounded-lg">
                          {categories.map((category) => (
                            <label key={category} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={category}
                                checked={formData.products.includes(category)}
                                onChange={(e) => {
                                  const { checked, value } = e.target;
                                  setFormData((prev) => ({
                                    ...prev,
                                    products: checked
                                      ? [...prev.products, value]
                                      : prev.products.filter((p) => p !== value),
                                  }));
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{category}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-700">Contacts</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addContact}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Contact
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {formData.contacts.map((contact, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-300 rounded-lg">
                              <Input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={contact.firstName}
                                onChange={(e) => handleInputChange(e, "firstName", i, "contact")}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              <Input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={contact.lastName}
                                onChange={(e) => handleInputChange(e, "lastName", i, "contact")}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              <Input
                                type="tel"
                                name="contactPhoneNumber"
                                placeholder="Phone Number"
                                value={contact.contactPhoneNumber}
                                onChange={(e) => handleInputChange(e, "contactPhoneNumber", i, "contact")}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                <Input
                                  type="email"
                                  name="contactEmailId"
                                  placeholder="Email"
                                  value={contact.contactEmailId}
                                  onChange={(e) => handleInputChange(e, "contactEmailId", i, "contact")}
                                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {formData.contacts.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeContact(i)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-700">Bank Details</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addBank}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Bank
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {formData.bankDetails.map((bank, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-300 rounded-lg">
                              <Input
                                type="text"
                                name="accountNumber"
                                placeholder="Account Number"
                                value={bank.accountNumber}
                                onChange={(e) => handleInputChange(e, "accountNumber", i, "bank")}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              <Input
                                type="text"
                                name="ifscCode"
                                placeholder="IFSC Code"
                                value={bank.ifscCode}
                                onChange={(e) => handleInputChange(e, "ifscCode", i, "bank")}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              <Input
                                type="text"
                                name="bankName"
                                placeholder="Bank Name"
                                value={bank.bankName}
                                onChange={(e) => handleInputChange(e, "bankName", i, "bank")}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  name="branchName"
                                  placeholder="Branch Name"
                                  value={bank.branchName}
                                  onChange={(e) => handleInputChange(e, "branchName", i, "bank")}
                                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {formData.bankDetails.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBank(i)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="px-6 py-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCreate}
                          className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {formData.id ? "Update Vendor" : "Create Vendor"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            {alert && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <Alert className={`${alert.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
                  <AlertDescription className={`${alert.type === "success" ? "text-green-800" : "text-red-800"}`}>
                    {alert.message}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <div className="rounded-lg overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Vendor ID</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Vendor Type</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Company Name</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">GST No.</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">State</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">City</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Products</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">GST Certificate</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Credit Terms</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentVendors.map((vendor) => (
                    <TableRow
                      key={vendor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="px-6 py-4 font-medium text-gray-900">{vendor.vendorCode}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{vendor.businessType}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{vendor.vendorName || 'N/A'}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{vendor.gstNo}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{vendor.state}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{vendor.city}</TableCell>
                      <TableCell className="px-6 py-4 text-amber-700">
                        {vendor.products.length > 0 ? vendor.products.join(", ") : "N/A"}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {vendor.gstpdf ? (
                          <a
                            href={`http://localhost:8000/gst/${vendor.gstpdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{vendor.creditTerms}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(vendor)}
                            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-colors duration-200"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(vendor.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-colors duration-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center mt-6 space-x-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 transition-all duration-200"
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              onClick={() => setCurrentPage(page)}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={`transition-all duration-200 ${
                page === currentPage 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "hover:bg-blue-50"
              }`}
            >
              {page}
            </Button>
          ))}

          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 transition-all duration-200"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorTable;
