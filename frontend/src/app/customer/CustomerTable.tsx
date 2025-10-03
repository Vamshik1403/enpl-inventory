"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, Search, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CustomerContact {
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

interface Customer {
  id?: number;
  customerCode: string;
  customerName: string;
  registerAddress: string;
  gstNo: string;
  gstpdf: string;
  businessType: string;
  state: string;
  city: string;
  emailId: string;
  website: string;
  products: string[];
  creditTerms: string;
  creditLimit: string;
  remark: string;
  contacts: CustomerContact[];
  bankDetails: BankDetail[];
}

const emptyContact: CustomerContact = {
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

const initialFormState: Customer = {
  customerCode: "",
  customerName: "",
  registerAddress: "",
  gstNo: "",
  gstpdf: "",
  businessType: "",
  state: "",
  city: "",
  emailId: "",
  website: "",
  products: [],
  creditTerms: "",
  creditLimit: "",
  remark: "",
  contacts: [emptyContact],
  bankDetails: [emptyBank],
};

const CustomerTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [gstpdfFile, setGstPdfFile] = useState<File | null>(null);
  const [existingGstFileName, setExistingGstFileName] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<Customer>(initialFormState);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

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
    fetchCategories();
    fetchCustomers();
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
      const updated = formData.contacts.map((c, i) =>
        i === index ? { ...c, [name]: value } : c
      );
      setFormData((prev) => ({ ...prev, contacts: updated }));
    } else if (type === "bank" && index !== undefined) {
      const updated = formData.bankDetails.map((b, i) =>
        i === index ? { ...b, [name]: value } : b
      );
      setFormData((prev) => ({ ...prev, bankDetails: updated }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addContact = () =>
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { ...emptyContact }],
    }));

  const removeContact = (index: number) => {
    const updated = [...formData.contacts];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, contacts: updated }));
  };

  const addBank = () =>
    setFormData((prev) => ({
      ...prev,
      bankDetails: [...prev.bankDetails, { ...emptyBank }],
    }));

  const removeBank = (index: number) => {
    const updated = [...formData.bankDetails];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, bankDetails: updated }));
  };

  const handleEdit = (customer: Customer) => {
    setFormData(customer);
    setGstPdfFile(null);
    setExistingGstFileName(customer.gstpdf || null);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    const confirm = window.confirm("Are you sure you want to delete this customer?");
    if (!confirm) return;
    try {
      await axios.delete(`http://localhost:8000/customers/${id}`);
      setAlert({ type: 'success', message: 'Customer deleted successfully!' });
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
      setAlert({ type: 'error', message: 'Failed to delete customer.' });
    }
  };

  const handleCreate = async () => {
    const required = [
      "customerName",
      "registerAddress",
      "gstNo",
      "businessType",
      "state",
      "city",
      "emailId",
      "website",
      "remark",
      "creditTerms",
      "creditLimit",
    ];

    const missing = required.filter(
      (f) => !formData[f as keyof Customer]?.toString().trim()
    );

    if (missing.length > 0) {
      setAlert({ type: 'error', message: `Missing fields: ${missing.join(", ")}` });
      return;
    }

    const validContacts = formData.contacts.filter(
      (c) =>
        c.firstName.trim() || c.lastName.trim() || c.contactPhoneNumber.trim()
    );

    const validBanks = formData.bankDetails.filter(
      (b) => b.accountNumber.trim() || b.ifscCode.trim() || b.bankName.trim()
    );

    if (validContacts.length === 0) {
      setAlert({ type: 'error', message: 'Add at least one valid contact.' });
      return;
    }

    try {
      const form = new FormData();

      // Append individual fields
      form.append("registerAddress", formData.registerAddress);
      form.append("gstNo", formData.gstNo);
      form.append("customerName", formData.customerName);
      form.append("businessType", formData.businessType);
      form.append("state", formData.state);
      form.append("city", formData.city);
      form.append("emailId", formData.emailId);
      form.append("website", formData.website);
      form.append("remark", formData.remark);
      form.append("creditTerms", formData.creditTerms.toString());
      form.append("creditLimit", formData.creditLimit.toString());

      // Append JSON-encoded nested data
      form.append("contacts", JSON.stringify(validContacts));
      form.append("bankDetails", JSON.stringify(validBanks));
      form.append("products", JSON.stringify(formData.products));

      // Append the GST certificate file with the correct field name
      if (gstpdfFile) {
        form.append("gstCertificate", gstpdfFile);
      }

      // Create or update
      if (formData.id) {
        await axios.put(
          `http://localhost:8000/customers/${formData.id}`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axios.post("http://localhost:8000/customers", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setAlert({
        type: 'success',
        message: formData.id
          ? "Customer updated successfully!"
          : "Customer created successfully!"
      });
      setFormData(initialFormState);
      setGstPdfFile(null);
      setIsCreateModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error("Error creating/updating customer:", err);
      setAlert({ type: 'error', message: 'Failed to submit. Please try again.' });
    }
  };
                     
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.emailId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <div className="flex-1 p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setFormData(initialFormState);
                        setAlert(null);
                        setGstPdfFile(null);
                        setExistingGstFileName(null);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Customer
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search customers..."
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
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Customer ID</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Customer Name</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Contacts</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Bank Details</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Products</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">GST No</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">GST Certificate</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="px-6 py-4 font-medium text-gray-900">{customer.customerCode}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{customer.customerName}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">
                        <div className="text-sm">
                          {customer.contacts.map((contact, index) => (
                            <div key={index} className="mb-1">
                              <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                              {contact.contactPhoneNumber && (
                                <div className="text-gray-600">{contact.contactPhoneNumber}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="text-sm">
                          {customer.bankDetails.map((bank, index) => (
                            <div key={index} className="mb-1">
                              <span className="font-medium">{bank.bankName}</span>
                              {bank.accountNumber && (
                                <div className="text-gray-600">{bank.accountNumber}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-yellow-800">
                        {Array.isArray(customer.products) ? customer.products.join(", ") : "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3">{customer.gstNo}</TableCell>
                      <TableCell className="px-4 py-3">
                        {customer.gstpdf ? (
                          <a
                            href={`http://localhost:8000/gst/${customer.gstpdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-gray-500">No PDF</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(customer)}
                            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-colors duration-200"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(customer.id)}
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

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black">
                {formData.id ? "Edit Customer" : "Create Customer"}
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
                    <SelectItem value="SOHO">SOHO</SelectItem>
                    <SelectItem value="SMB">SMB</SelectItem>
                    <SelectItem value="ENT">ENT</SelectItem>
                    <SelectItem value="EDU">EDU</SelectItem>
                    <SelectItem value="NPO">NPO</SelectItem>
                    <SelectItem value="GOV">GOV</SelectItem>
                    <SelectItem value="Reseller">Reseller</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                { [
                  { name: "customerName", label: "Customer Name", type: "text" },
                  { name: "registerAddress", label: "Register Address", type: "text" },
                  { name: "state", label: "State", type: "text" },
                  { name: "city", label: "City", type: "text" },
                  { name: "gstNo", label: "GST No", type: "text" },
                  { name: "emailId", label: "Email ID", type: "email" },
                  { name: "creditTerms", label: "Credit Terms", type: "text" },
                  { name: "creditLimit", label: "Credit Limit", type: "text" },
                  { name: "website", label: "Website", type: "url" },
                  { name: "remark", label: "Remark", type: "text" },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                      {field.label}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      value={(formData as any)[field.name] || ""}
                      onChange={(e) => handleInputChange(e, field.name)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                ))}
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
                      setExistingGstFileName(null);
                    } else {
                      setAlert({ type: 'error', message: 'Please upload a valid PDF file.' });
                    }
                  }}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {gstpdfFile && (
                  <p className="text-sm text-green-600 mt-1">{gstpdfFile.name}</p>
                )}
                {!gstpdfFile && existingGstFileName && (
                  <a
                    href={`http://localhost:8000/gst/${existingGstFileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm mt-2 block transition-colors duration-200"
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

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium text-gray-700">Contacts</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addContact}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Contact
                  </Button>
                </div>
                {formData.contacts.map((contact, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 items-end">
                    {Object.keys(emptyContact).map((key) => (
                      <div key={key}>
                        <Label className="text-xs text-gray-600">
                          {key.replace(/([A-Z])/g, " $1")}
                        </Label>
                        <Input
                          name={key}
                          placeholder={key.replace(/([A-Z])/g, " $1")}
                          value={(contact as any)[key]}
                          onChange={(e) => handleInputChange(e, key, i, "contact")}
                          className="mt-1"
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeContact(i)}
                      className="hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium text-gray-700">Bank Details</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBank}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Bank
                  </Button>
                </div>
                {formData.bankDetails.map((bank, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 items-end">
                    {Object.keys(emptyBank).map((key) => (
                      <div key={key}>
                        <Label className="text-xs text-gray-600">
                          {key.replace(/([A-Z])/g, " $1")}
                        </Label>
                        <Input
                          name={key}
                          placeholder={key.replace(/([A-Z])/g, " $1")}
                          value={(bank as any)[key]}
                          onChange={(e) => handleInputChange(e, key, i, "bank")}
                          className="mt-1"
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBank(i)}
                      className="hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
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
                  {formData.id ? "Update Customer" : "Create Customer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerTable;
