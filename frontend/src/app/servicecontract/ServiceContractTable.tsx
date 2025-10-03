"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilLine, Trash2, Search, Plus, Package } from "lucide-react";
import { SimpleCustomerSelect } from "@/components/ui/SimpleCustomerSelect";
import { SimpleSiteSelect } from "@/components/ui/SimpleSiteSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Customer {
  id: number;
  customerName: string;
}

interface Site {
  id: number;
  siteName: string;
  customerId: number;
}

interface ServiceContract {
  id: number;
  customerId: number;
  siteId: number;
  relmanager: string;
  startDate: string;
  endDate: string;
  serviceCategory: string;
  visitSite: number;
  maintenanceVisit: number;
  contractDescription: string;
  Customer?: Customer;
  Site?: Site;
}

export default function ServiceContractTable() {
  const [contracts, setContracts] = useState<ServiceContract[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ServiceContract | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    customerId: 0,
    siteId: 0,
    relmanager: "",
    startDate: "",
    endDate: "",
    serviceCategory: "",
    visitSite: 0,
    maintenanceVisit: 0,
    contractDescription: "",
  });

  const showAlert = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/servicecontracts");
      setContracts(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch contracts");
      console.error("Error fetching contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/customers");
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axios.get("http://localhost:8000/sites");
      setSites(response.data);
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchCustomers();
    fetchSites();
  }, []);

  const filteredContracts = contracts.filter(contract =>
    contract.contractDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.Customer?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.Site?.siteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'visitSite' || name === 'maintenanceVisit' ? Number(value) : value
    }));
  };

  const handleCustomerChange = (customerId: number) => {
    setFormData(prev => ({
      ...prev,
      customerId,
      siteId: 0
    }));
  };

  const handleSiteChange = (siteId: number) => {
    setFormData(prev => ({
      ...prev,
      siteId
    }));
  };

  const handleAddContract = async () => {
    try {
      const response = await axios.post("http://localhost:8000/servicecontracts", formData);
      setContracts([...contracts, response.data]);
      setFormData({
        customerId: 0,
        siteId: 0,
        relmanager: "",
        startDate: "",
        endDate: "",
        serviceCategory: "",
        visitSite: 0,
        maintenanceVisit: 0,
        contractDescription: "",
      });
      setIsAddModalOpen(false);
      showAlert("Contract added successfully", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to add contract", "error");
    }
  };

  const handleUpdateContract = async () => {
    if (!selectedContract) return;

    try {
      const response = await axios.put(`http://localhost:8000/servicecontracts/${selectedContract.id}`, formData);
      setContracts(contracts.map(contract => 
        contract.id === selectedContract.id ? response.data : contract
      ));
      setIsEditModalOpen(false);
      setSelectedContract(null);
      showAlert("Contract updated successfully", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to update contract", "error");
    }
  };

  const handleDeleteContract = async () => {
    if (!selectedContract) return;

    try {
      await axios.delete(`http://localhost:8000/servicecontracts/${selectedContract.id}`);
      setContracts(contracts.filter(contract => contract.id !== selectedContract.id));
      setIsDeleteModalOpen(false);
      setSelectedContract(null);
      showAlert("Contract deleted successfully", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to delete contract", "error");
    }
  };

  const openEditModal = (contract: ServiceContract) => {
    setSelectedContract(contract);
    
    // Format dates to YYYY-MM-DD format for HTML date inputs
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      customerId: contract.customerId,
      siteId: contract.siteId,
      relmanager: contract.relmanager,
      startDate: formatDateForInput(contract.startDate),
      endDate: formatDateForInput(contract.endDate),
      serviceCategory: contract.serviceCategory,
      visitSite: contract.visitSite,
      maintenanceVisit: contract.maintenanceVisit,
      contractDescription: contract.contractDescription,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (contract: ServiceContract) => {
    setSelectedContract(contract);
    setIsDeleteModalOpen(true);
  };

  const getAvailableSites = () => {
    return sites.filter(site => site.customerId === formData.customerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Contracts</h1>
          <p className="text-gray-600 mt-1">Manage your service contracts</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Add Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add New Contract</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerId">Customer</Label>
                  <SimpleCustomerSelect
                    selectedValue={formData.customerId}
                    onSelect={handleCustomerChange}
                    placeholder="Select Customer"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="siteId">Site</Label>
                  <SimpleSiteSelect
                    selectedValue={formData.siteId}
                    onSelect={handleSiteChange}
                    placeholder="Select Site"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="relmanager">Relationship Manager</Label>
                  <Input
                    id="relmanager"
                    name="relmanager"
                    value={formData.relmanager}
                    onChange={handleInputChange}
                    placeholder="Enter relationship manager"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <Input
                    id="serviceCategory"
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleInputChange}
                    placeholder="Enter service category"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="visitSite">Visit Site</Label>
                  <Input
                    id="visitSite"
                    name="visitSite"
                    type="number"
                    value={formData.visitSite}
                    onChange={handleInputChange}
                    placeholder="Enter visit site count"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maintenanceVisit">Maintenance Visit</Label>
                  <Input
                    id="maintenanceVisit"
                    name="maintenanceVisit"
                    type="number"
                    value={formData.maintenanceVisit}
                    onChange={handleInputChange}
                    placeholder="Enter maintenance visit count"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contractDescription">Contract Description</Label>
                <Input
                  id="contractDescription"
                  name="contractDescription"
                  value={formData.contractDescription}
                  onChange={handleInputChange}
                  placeholder="Enter contract description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddContract} 
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!formData.customerId || !formData.siteId || !formData.contractDescription}
              >
                Add Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {(success || error) && (
        <Alert className={`mb-4 ${success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <AlertDescription className={success ? 'text-green-800' : 'text-red-800'}>
            {success || error}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold">All Contracts</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.Customer?.customerName || 'N/A'}</TableCell>
                  <TableCell>{contract.Site?.siteName || 'N/A'}</TableCell>
                  <TableCell>{contract.contractDescription}</TableCell>
                  <TableCell>{contract.serviceCategory}</TableCell>
                  <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(contract)}
                        className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-colors duration-200"
                      >
                        <PencilLine className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(contract)}
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

        {filteredContracts.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No contracts found</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredContracts.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredContracts.length)} of {filteredContracts.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Contract</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-customerId">Customer</Label>
                <SimpleCustomerSelect
                  selectedValue={formData.customerId}
                  onSelect={handleCustomerChange}
                  placeholder="Select Customer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-siteId">Site</Label>
                <SimpleSiteSelect
                  selectedValue={formData.siteId}
                  onSelect={handleSiteChange}
                  placeholder="Select Site"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-relmanager">Relationship Manager</Label>
                <Input
                  id="edit-relmanager"
                  name="relmanager"
                  value={formData.relmanager}
                  onChange={handleInputChange}
                  placeholder="Enter relationship manager"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-serviceCategory">Service Category</Label>
                <Input
                  id="edit-serviceCategory"
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleInputChange}
                  placeholder="Enter service category"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-visitSite">Visit Site</Label>
                <Input
                  id="edit-visitSite"
                  name="visitSite"
                  type="number"
                  value={formData.visitSite}
                  onChange={handleInputChange}
                  placeholder="Enter visit site count"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-maintenanceVisit">Maintenance Visit</Label>
                <Input
                  id="edit-maintenanceVisit"
                  name="maintenanceVisit"
                  type="number"
                  value={formData.maintenanceVisit}
                  onChange={handleInputChange}
                  placeholder="Enter maintenance visit count"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contractDescription">Contract Description</Label>
              <Input
                id="edit-contractDescription"
                name="contractDescription"
                value={formData.contractDescription}
                onChange={handleInputChange}
                placeholder="Enter contract description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateContract} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!formData.customerId || !formData.siteId || !formData.contractDescription}
            >
              Update Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Contract</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete this contract? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteContract} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
