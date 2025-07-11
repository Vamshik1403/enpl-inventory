"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Customer {
  id: number;
  customerName: string;
}

interface Site {
  id: number;
  siteCode: string;
  Customer: Customer;
  siteName: string;
  siteAddress: string;
  state: string;
  city: string;
  gstNo: string;
  gstpdf: string;
  contactName: string[] | string;
  contactNumber: string[] | string;
  emailId: string[] | string;
}

interface FormData {
  siteName: string;
  siteAddress: string;
  state: string;
  city: string;
  gstNo: string;
  gstpdf: string;
  contactName: string[] | string;
  contactNumber: string[] | string;
  emailId: string[] | string;
  customerId: number;
}

const SiteTable: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [gstPdfFile, setGstPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    siteName: "",
    siteAddress: "",
    state: "",
    city: "",
    gstNo: "",
    gstpdf: "",
    contactName: [""],
    contactNumber: [""],
    emailId: [""],
    customerId: 0,
  });
  const itemsPerPage = 5;

  const fetchSites = async () => {
    try {
      const response = await axios.get("http://192.168.0.102:8000/sites");
      setSites(response.data.reverse());
    } catch (error) {
      console.error("Error fetching sites:", error);
      setAlertMessage("Failed to fetch sites.");
      setAlertType("error");
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://192.168.0.102:8000/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setAlertMessage("Failed to fetch customers.");
      setAlertType("error");
    }
  };

  useEffect(() => {
    fetchSites();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const filteredSites = sites.filter((site) =>
    site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.Customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.siteAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSites = filteredSites.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSites.length / itemsPerPage);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      const updatedArray = [...(formData[name as keyof FormData] as string[])];
      updatedArray[index] = value;
      setFormData({ ...formData, [name]: updatedArray });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      contactName: Array.isArray(formData.contactName) ? [...formData.contactName, ""] : [formData.contactName || "", ""],
      contactNumber: Array.isArray(formData.contactNumber) ? [...formData.contactNumber, ""] : [formData.contactNumber || "", ""],
      emailId: Array.isArray(formData.emailId) ? [...formData.emailId, ""] : [formData.emailId || "", ""],
    });
  };

  const handleRemoveField = (field: "contactName" | "contactNumber" | "emailId", index: number) => {
    const contactNameArray = Array.isArray(formData.contactName) ? formData.contactName : [formData.contactName || ""];
    const contactNumberArray = Array.isArray(formData.contactNumber) ? formData.contactNumber : [formData.contactNumber || ""];
    const emailIdArray = Array.isArray(formData.emailId) ? formData.emailId : [formData.emailId || ""];
    
    const updatedContactName = contactNameArray.filter((_, i) => i !== index);
    const updatedContactNumber = contactNumberArray.filter((_, i) => i !== index);
    const updatedEmailId = emailIdArray.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      contactName: updatedContactName,
      contactNumber: updatedContactNumber,
      emailId: updatedEmailId,
    });
  };

  const handleCreate = async () => {
    try {
      const payload = new FormData();
      payload.append("siteName", formData.siteName);
      payload.append("siteAddress", formData.siteAddress);
      payload.append("state", formData.state);
      payload.append("city", formData.city);
      payload.append("gstNo", formData.gstNo);
      payload.append("contactName", JSON.stringify(formData.contactName));
      payload.append("contactNumber", JSON.stringify(formData.contactNumber));
      payload.append("emailId", JSON.stringify(formData.emailId));
      payload.append("customerId", formData.customerId.toString());
      if (gstPdfFile) {
        payload.append("gstpdf", gstPdfFile);
      }

      await axios.post("http://192.168.0.102:8000/sites", payload);
      setAlertMessage("Site created successfully!");
      setAlertType("success");
      setIsCreateModalOpen(false);
      setFormData({
        siteName: "",
        siteAddress: "",
        state: "",
        city: "",
        gstNo: "",
        gstpdf: "",
        contactName: [""],
        contactNumber: [""],
        emailId: [""],
        customerId: 0,
      });
      setGstPdfFile(null);
      fetchSites();
    } catch (error) {
      console.error("Error creating site:", error);
      setAlertMessage("Failed to create site.");
      setAlertType("error");
    }
  };

  const handleUpdate = async () => {
    if (!currentSite) return;
    try {
      const payload = new FormData();
      payload.append("siteName", formData.siteName);
      payload.append("siteAddress", formData.siteAddress);
      payload.append("state", formData.state);
      payload.append("city", formData.city);
      payload.append("gstNo", formData.gstNo);
      payload.append("contactName", JSON.stringify(formData.contactName));
      payload.append("contactNumber", JSON.stringify(formData.contactNumber));
      payload.append("emailId", JSON.stringify(formData.emailId));
      payload.append("customerId", formData.customerId.toString());
      if (gstPdfFile) {
        payload.append("gstpdf", gstPdfFile);
      }

      await axios.put(`http://192.168.0.102:8000/sites/${currentSite.id}`, payload);
      setAlertMessage("Site updated successfully!");
      setAlertType("success");
      setIsUpdateModalOpen(false);
      setCurrentSite(null);
      fetchSites();
    } catch (error) {
      console.error("Error updating site:", error);
      setAlertMessage("Failed to update site.");
      setAlertType("error");
    }
  };

  const handleEdit = (site: Site) => {
    setCurrentSite(site);
    setFormData({
      siteName: site.siteName,
      siteAddress: site.siteAddress,
      state: site.state,
      city: site.city,
      gstNo: site.gstNo,
      gstpdf: site.gstpdf,
      contactName: site.contactName,
      contactNumber: site.contactNumber,
      emailId: site.emailId,
      customerId: site.Customer.id,
    });
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Are you sure you want to delete this site?");
    if (!confirm) return;

    try {
      await axios.delete(`http://192.168.0.102:8000/sites/${id}`);
      setAlertMessage("Site deleted successfully!");
      setAlertType("success");
      fetchSites();
    } catch (error) {
      console.error("Error deleting site:", error);
      setAlertMessage("Failed to delete site.");
      setAlertType("error");
    }
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-8 w-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">Site Management</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setFormData({
                          siteName: "",
                          siteAddress: "",
                          state: "",
                          city: "",
                          gstNo: "",
                          gstpdf: "",
                          contactName: [""],
                          contactNumber: [""],
                          emailId: [""],
                          customerId: 0,
                        });
                        setGstPdfFile(null);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Customer Site
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-800">
                        Add Customer Site
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Customer</Label>
                        <Select
                          value={formData.customerId ? formData.customerId.toString() : ""}
                          onValueChange={(value) =>
                            handleInputChange({
                              target: { name: "customerId", value }
                            } as React.ChangeEvent<HTMLSelectElement>)
                          }
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select Customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.customerName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="siteName" className="text-sm font-medium text-gray-700">Site Name</Label>
                          <Input
                            id="siteName"
                            name="siteName"
                            value={formData.siteName}
                            onChange={handleInputChange}
                            placeholder="Enter site name"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="siteAddress" className="text-sm font-medium text-gray-700">Site Address</Label>
                          <Input
                            id="siteAddress"
                            name="siteAddress"
                            value={formData.siteAddress}
                            onChange={handleInputChange}
                            placeholder="Enter site address"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Enter state"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Enter city"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gstNo" className="text-sm font-medium text-gray-700">GST No</Label>
                          <Input
                            id="gstNo"
                            name="gstNo"
                            value={formData.gstNo}
                            onChange={handleInputChange}
                            placeholder="Enter GST number"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gstPdfFile" className="text-sm font-medium text-gray-700">GST Certificate (PDF)</Label>
                        <Input
                          id="gstPdfFile"
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setGstPdfFile(e.target.files?.[0] || null)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {gstPdfFile && (
                          <p className="text-sm text-green-600 mt-1">{gstPdfFile.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddField}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Contact
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {(Array.isArray(formData.contactName) ? formData.contactName : [formData.contactName || ""]).map((_, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-gray-300 rounded-lg">
                              <Input
                                type="text"
                                name="contactName"
                                value={(Array.isArray(formData.contactName) ? formData.contactName : [formData.contactName || ""])[index] || ""}
                                onChange={(e) => handleInputChange(e, index)}
                                placeholder="Contact Name"
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              <Input
                                type="tel"
                                name="contactNumber"
                                value={(Array.isArray(formData.contactNumber) ? formData.contactNumber : [formData.contactNumber || ""])[index] || ""}
                                onChange={(e) => handleInputChange(e, index)}
                                placeholder="Contact Number"
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                <Input
                                  type="email"
                                  name="emailId"
                                  value={(Array.isArray(formData.emailId) ? formData.emailId : [formData.emailId || ""])[index] || ""}
                                  onChange={(e) => handleInputChange(e, index)}
                                  placeholder="Email ID"
                                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {formData.contactName.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveField("contactName", index)}
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
                          Create Site
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search sites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
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

            <div className="rounded-lg overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Site Code</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Customer Name</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Site Name</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Site Address</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">State</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">City</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">GST No</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">GST PDF</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Contact Name</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Contact Number</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Email ID</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSites.map((site) => (
                    <TableRow
                      key={site.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="px-6 py-4 font-medium text-gray-900">{site.siteCode}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{site.Customer.customerName}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{site.siteName}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{site.siteAddress}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{site.state}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{site.city}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{site.gstNo}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">
                        {site.gstpdf ? (
                          <a
                            href={`http://192.168.0.102:8000/gst/${site.gstpdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">
                        {Array.isArray(site.contactName) 
                          ? site.contactName.join(", ") 
                          : site.contactName || "N/A"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">
                        {Array.isArray(site.contactNumber) 
                          ? site.contactNumber.join(", ") 
                          : site.contactNumber || "N/A"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">
                        {Array.isArray(site.emailId) 
                          ? site.emailId.join(", ") 
                          : site.emailId || "N/A"}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(site)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(site.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center items-center mt-6 space-x-2"
        >
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
        </motion.div>

        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Update Site
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Customer</Label>
                <Select
                  value={formData.customerId ? formData.customerId.toString() : ""}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "customerId", value }
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-sm font-medium text-gray-700">Site Name</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={formData.siteName}
                    onChange={handleInputChange}
                    placeholder="Enter site name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteAddress" className="text-sm font-medium text-gray-700">Site Address</Label>
                  <Input
                    id="siteAddress"
                    name="siteAddress"
                    value={formData.siteAddress}
                    onChange={handleInputChange}
                    placeholder="Enter site address"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstNo" className="text-sm font-medium text-gray-700">GST No</Label>
                  <Input
                    id="gstNo"
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleInputChange}
                    placeholder="Enter GST number"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstPdfFile" className="text-sm font-medium text-gray-700">GST Certificate (PDF)</Label>
                <Input
                  id="gstPdfFile"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setGstPdfFile(e.target.files?.[0] || null)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {gstPdfFile && (
                  <p className="text-sm text-green-600 mt-1">{gstPdfFile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddField}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Contact
                  </Button>
                </div>
                <div className="space-y-3">
                  {(Array.isArray(formData.contactName) ? formData.contactName : [formData.contactName || ""]).map((_, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-gray-300 rounded-lg">
                      <Input
                        type="text"
                        name="contactName"
                        value={(Array.isArray(formData.contactName) ? formData.contactName : [formData.contactName || ""])[index] || ""}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="Contact Name"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Input
                        type="tel"
                        name="contactNumber"
                        value={(Array.isArray(formData.contactNumber) ? formData.contactNumber : [formData.contactNumber || ""])[index] || ""}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="Contact Number"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="email"
                          name="emailId"
                          value={(Array.isArray(formData.emailId) ? formData.emailId : [formData.emailId || ""])[index] || ""}
                          onChange={(e) => handleInputChange(e, index)}
                          placeholder="Email ID"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {(Array.isArray(formData.contactName) ? formData.contactName : [formData.contactName || ""]).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveField("contactName", index)}
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
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                >
                  Update Site
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default SiteTable;
