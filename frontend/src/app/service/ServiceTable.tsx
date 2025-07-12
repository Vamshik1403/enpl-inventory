"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Service {
  id: number;
  serviceSkuId: string;
  serviceName: string;
  serviceDescription: string;
  SAC: string;
  serviceCategoryId: number;
  serviceSubCategoryId: number;
  category?: {
    id: number;
    categoryName: string;
  };
  subCategory?: {
    id: number;
    subCategoryName: string;
  };
}

interface Category {
  id: number;
  categoryName: string;
  subCategories: { id: number; subCategoryName: string }[];
}

interface Subcategory {
  id: number;
  subCategoryName: string;
  serviceCategoryId: number;
}

export default function ServiceTable() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
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
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    serviceSkuId: "",
    serviceName: "",
    serviceDescription: "",
    SAC: "",
    serviceCategoryId: 0,
    serviceSubCategoryId: 0,
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

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://192.168.29.167:8000/service");
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch services");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://192.168.29.167:8000/servicecategory");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get("http://192.168.29.167:8000/servicesubcategory");
      setSubcategories(response.data);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const filteredServices = services.filter(service =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.serviceSkuId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.category?.categoryName && service.category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.subCategory?.subCategoryName && service.subCategory.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceCategoryId: parseInt(categoryId),
      serviceSubCategoryId: 0
    }));
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceSubCategoryId: parseInt(subcategoryId)
    }));
  };

  const handleAddService = async () => {
    try {
      const response = await axios.post("http://192.168.29.167:8000/service", formData);
      setServices([...services, response.data]);
      setFormData({
        serviceSkuId: "",
        serviceName: "",
        serviceDescription: "",
        SAC: "",
        serviceCategoryId: 0,
        serviceSubCategoryId: 0,
      });
      setIsAddModalOpen(false);
      showAlert("Service added successfully", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to add service", "error");
    }
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    try {
      const response = await axios.put(`http://192.168.29.167:8000/service/${selectedService.id}`, formData);
      setServices(services.map(service => 
        service.id === selectedService.id ? response.data : service
      ));
      setIsEditModalOpen(false);
      setSelectedService(null);
      showAlert("Service updated successfully", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to update service", "error");
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await axios.delete(`http://192.168.29.167:8000/service/${selectedService.id}`);
      setServices(services.filter(service => service.id !== selectedService.id));
      setIsDeleteModalOpen(false);
      setSelectedService(null);
      showAlert("Service deleted successfully", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to delete service", "error");
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData({
      serviceSkuId: service.serviceSkuId,
      serviceName: service.serviceName,
      serviceDescription: service.serviceDescription,
      SAC: service.SAC,
      serviceCategoryId: service.serviceCategoryId,
      serviceSubCategoryId: service.serviceSubCategoryId,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (service: Service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const getAvailableSubcategories = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.subCategories : [];
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
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">Manage your services and offerings</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add New Service</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="serviceSkuId">Service SKU ID</Label>
                <Input
                  id="serviceSkuId"
                  name="serviceSkuId"
                  value={formData.serviceSkuId}
                  onChange={handleInputChange}
                  placeholder="Enter service SKU ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serviceDescription">Description</Label>
                <Input
                  id="serviceDescription"
                  name="serviceDescription"
                  value={formData.serviceDescription}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="SAC">SAC</Label>
                <Input
                  id="SAC"
                  name="SAC"
                  value={formData.SAC}
                  onChange={handleInputChange}
                  placeholder="Enter SAC"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serviceCategoryId">Category</Label>
                <Combobox
                  options={categories.map(category => ({
                    label: category.categoryName,
                    value: category.id.toString()
                  }))}
                  value={formData.serviceCategoryId.toString()}
                  onChange={handleCategoryChange}
                  placeholder="Select category"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serviceSubCategoryId">Subcategory</Label>
                <Combobox
                  options={getAvailableSubcategories(formData.serviceCategoryId).map(subcategory => ({
                    label: subcategory.subCategoryName,
                    value: subcategory.id.toString()
                  }))}
                  value={formData.serviceSubCategoryId.toString()}
                  onChange={handleSubcategoryChange}
                  placeholder="Select subcategory"
                  disabled={!formData.serviceCategoryId}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddService} 
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!formData.serviceName || !formData.serviceCategoryId || !formData.serviceSubCategoryId}
              >
                Add Service
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
              <h2 className="text-lg font-semibold">All Services</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search services..."
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
                <TableHead>Service Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.serviceName}</TableCell>
                  <TableCell>{service.serviceDescription}</TableCell>
                  <TableCell>{service.category?.categoryName || 'N/A'}</TableCell>
                  <TableCell>{service.subCategory?.subCategoryName || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(service)}
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

        {filteredServices.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No services found</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredServices.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} results
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
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Service</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-serviceSkuId">Service SKU ID</Label>
              <Input
                id="edit-serviceSkuId"
                name="serviceSkuId"
                value={formData.serviceSkuId}
                onChange={handleInputChange}
                placeholder="Enter service SKU ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-serviceName">Service Name</Label>
              <Input
                id="edit-serviceName"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleInputChange}
                placeholder="Enter service name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-serviceDescription">Description</Label>
              <Input
                id="edit-serviceDescription"
                name="serviceDescription"
                value={formData.serviceDescription}
                onChange={handleInputChange}
                placeholder="Enter service description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-SAC">SAC</Label>
              <Input
                id="edit-SAC"
                name="SAC"
                value={formData.SAC}
                onChange={handleInputChange}
                placeholder="Enter SAC"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-serviceCategoryId">Category</Label>
              <Combobox
                options={categories.map(category => ({
                  label: category.categoryName,
                  value: category.id.toString()
                }))}
                value={formData.serviceCategoryId.toString()}
                onChange={handleCategoryChange}
                placeholder="Select category"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-serviceSubCategoryId">Subcategory</Label>
              <Combobox
                options={getAvailableSubcategories(formData.serviceCategoryId).map(subcategory => ({
                  label: subcategory.subCategoryName,
                  value: subcategory.id.toString()
                }))}
                value={formData.serviceSubCategoryId.toString()}
                onChange={handleSubcategoryChange}
                placeholder="Select subcategory"
                disabled={!formData.serviceCategoryId}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateService} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!formData.serviceName || !formData.serviceCategoryId || !formData.serviceSubCategoryId}
            >
              Update Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Service</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete "{selectedService?.serviceName}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteService} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
