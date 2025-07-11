"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Category {
  id: number;
  categoryName: string;
}

interface SubCategory {
  id: number;
  serviceSubCatId: string;
  subCategoryName: string;
  serviceCategoryId: number;
  category: Category;
}

export default function ServiceSubCategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
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
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    serviceSubCatId: "",
    subCategoryName: "",
    serviceCategoryId: 0,
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://http://192.168.29.167:8000/servicecategory");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://http://192.168.29.167:8000/servicesubcategory");
      setSubCategories(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch subcategories");
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const filteredSubCategories = subCategories.filter(subCategory =>
    subCategory.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subCategory.category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubCategories.length / itemsPerPage);
  const paginatedSubCategories = filteredSubCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceCategoryId: parseInt(categoryId)
    }));
  };

  const handleAddSubCategory = async () => {
    try {
      const response = await axios.post("http://http://192.168.29.167:8000/servicesubcategory", formData);
      setSubCategories([...subCategories, response.data]);
      setFormData({
        serviceSubCatId: "",
        subCategoryName: "",
        serviceCategoryId: 0,
      });
      setIsAddModalOpen(false);
      showAlert("Subcategory added successfully", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to add subcategory", "error");
    }
  };

  const handleUpdateSubCategory = async () => {
    if (!selectedSubCategory) return;

    try {
      const response = await axios.put(`http://http://192.168.29.167:8000/servicesubcategory/${selectedSubCategory.id}`, formData);
      setSubCategories(subCategories.map(subCategory => 
        subCategory.id === selectedSubCategory.id ? response.data : subCategory
      ));
      setIsEditModalOpen(false);
      setSelectedSubCategory(null);
      showAlert("Subcategory updated successfully", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to update subcategory", "error");
    }
  };

  const handleDeleteSubCategory = async () => {
    if (!selectedSubCategory) return;

    try {
      await axios.delete(`http://http://192.168.29.167:8000/servicesubcategory/${selectedSubCategory.id}`);
      setSubCategories(subCategories.filter(subCategory => subCategory.id !== selectedSubCategory.id));
      setIsDeleteModalOpen(false);
      setSelectedSubCategory(null);
      showAlert("Subcategory deleted successfully", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to delete subcategory", "error");
    }
  };

  const openEditModal = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setFormData({
      serviceSubCatId: subCategory.serviceSubCatId,
      subCategoryName: subCategory.subCategoryName,
      serviceCategoryId: subCategory.serviceCategoryId,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setIsDeleteModalOpen(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Service Subcategories</h1>
          <p className="text-gray-600 mt-1">Manage your service subcategories</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add New Subcategory</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="serviceSubCatId">Subcategory ID</Label>
                <Input
                  id="serviceSubCatId"
                  name="serviceSubCatId"
                  value={formData.serviceSubCatId}
                  onChange={handleInputChange}
                  placeholder="Enter subcategory ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subCategoryName">Subcategory Name</Label>
                <Input
                  id="subCategoryName"
                  name="subCategoryName"
                  value={formData.subCategoryName}
                  onChange={handleInputChange}
                  placeholder="Enter subcategory name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serviceCategoryId">Category</Label>
                <Select value={formData.serviceCategoryId.toString()} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSubCategory} 
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!formData.subCategoryName || !formData.serviceCategoryId}
              >
                Add Subcategory
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
              <Settings className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold">All Subcategories</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search subcategories..."
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
                <TableHead>Subcategory Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubCategories.map((subCategory) => (
                <TableRow key={subCategory.id}>
                  <TableCell className="font-medium">{subCategory.subCategoryName}</TableCell>
                  <TableCell>{subCategory.category.categoryName}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(subCategory)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(subCategory)}
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

        {filteredSubCategories.length === 0 && (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No subcategories found</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredSubCategories.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredSubCategories.length)} of {filteredSubCategories.length} results
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
            <DialogTitle className="text-xl font-semibold">Edit Subcategory</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-serviceSubCatId">Subcategory ID</Label>
              <Input
                id="edit-serviceSubCatId"
                name="serviceSubCatId"
                value={formData.serviceSubCatId}
                onChange={handleInputChange}
                placeholder="Enter subcategory ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-subCategoryName">Subcategory Name</Label>
              <Input
                id="edit-subCategoryName"
                name="subCategoryName"
                value={formData.subCategoryName}
                onChange={handleInputChange}
                placeholder="Enter subcategory name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-serviceCategoryId">Category</Label>
              <Select value={formData.serviceCategoryId.toString()} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSubCategory} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!formData.subCategoryName || !formData.serviceCategoryId}
            >
              Update Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Subcategory</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete "{selectedSubCategory?.subCategoryName}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteSubCategory} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
