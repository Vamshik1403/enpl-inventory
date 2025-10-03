"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, Search, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SubCategory {
  id: number;
  subCategoryName: string;
}

interface Category {
  id: number;
  serviceCatId: string;
  categoryName: string;
  subCategories: SubCategory[];
}

const ServiceCategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const [formData, setFormData] = useState({
    serviceCatId: "",
    categoryName: "",
    subCategories: [{ subCategoryName: "" }],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/servicecategory");
      setCategories(response.data.reverse());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:8000/servicecategory/${id}`);
        setAlert({ type: 'success', message: 'Category deleted successfully!' });
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        setAlert({ type: 'error', message: 'Failed to delete category. Ensure there are no dependent entries.' });
      }
    }
  };

  const handleCreate = async () => {
    const { categoryName } = formData;

    if (!categoryName) {
      setAlert({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }
    try {
      await axios.post("http://localhost:8000/servicecategory", {
        serviceCatId: formData.serviceCatId,
        categoryName: formData.categoryName,
        subCategories: formData.subCategories,
      });
      setAlert({ type: 'success', message: 'Category created successfully!' });
      setIsCreateModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      setAlert({ type: 'error', message: 'Failed to create category.' });
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;

    try {
      await axios.put(`http://localhost:8000/servicecategory/${selectedCategory.id}`, {
        serviceCatId: formData.serviceCatId,
        categoryName: formData.categoryName,
        subCategories: formData.subCategories,
      });
      setAlert({ type: 'success', message: 'Category updated successfully!' });
      setIsUpdateModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      setAlert({ type: 'error', message: 'Failed to update category.' });
    }
  };

  useEffect(() => {
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

  // Filter and sort logic
  const filteredCategories = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.serviceCatId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aVal = a[key as keyof Category];
    const bVal = b[key as keyof Category];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentCategories = sortedCategories.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex-1 p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">Service Category Management</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setIsCreateModalOpen(true);
                        setFormData({ categoryName: "", subCategories: [{ subCategoryName: "" }], serviceCatId: "" });
                        setAlert(null);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service Category
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <AnimatePresence>
              {alert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4"
                >
                  <Alert className={`${alert.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <AlertDescription className={`${alert.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                      {alert.message}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead 
                        className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          setSortConfig((prev) =>
                            prev?.key === "serviceCatId"
                              ? { key: "serviceCatId", direction: prev.direction === "asc" ? "desc" : "asc" }
                              : { key: "serviceCatId", direction: "asc" }
                          )
                        }
                      >
                        Service Cat ID ⬍
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          setSortConfig((prev) =>
                            prev?.key === "categoryName"
                              ? { key: "categoryName", direction: prev.direction === "asc" ? "desc" : "asc" }
                              : { key: "categoryName", direction: "asc" }
                          )
                        }
                      >
                        Category Name ⬍
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCategories.length > 0 ? (
                      currentCategories.map((category, index) => (
                        <TableRow
                          key={category.id}
                          className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200"
                        >
                          <TableCell className="font-medium">{category.serviceCatId}</TableCell>
                          <TableCell>{category.categoryName}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setFormData({
                                    serviceCatId: category.serviceCatId,
                                    categoryName: category.categoryName,
                                    subCategories: category.subCategories,
                                  });
                                  setIsUpdateModalOpen(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-colors duration-200"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(category.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-colors duration-200"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center p-8 text-gray-500">
                          No categories available.
                        </TableCell>
                      </TableRow>
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
                {Array.from({ length: Math.ceil(filteredCategories.length / itemsPerPage) }, (_, i) => (
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
                  setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredCategories.length / itemsPerPage)))
                }
                disabled={currentPage === Math.ceil(filteredCategories.length / itemsPerPage)}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Create Service Category
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="serviceCatId" className="text-sm font-medium text-gray-700">
                  Service Category ID
                </Label>
                <Input
                  id="serviceCatId"
                  type="text"
                  value={formData.serviceCatId}
                  onChange={(e) => setFormData({ ...formData, serviceCatId: e.target.value })}
                  placeholder="Enter service category ID"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700">
                  Category Name
                </Label>
                <Input
                  id="categoryName"
                  type="text"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  placeholder="Enter category name"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreate}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-colors duration-200"
                >
                  Create Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Update Modal */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Edit Service Category
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="editServiceCatId" className="text-sm font-medium text-gray-700">
                  Service Category ID
                </Label>
                <Input
                  id="editServiceCatId"
                  type="text"
                  value={formData.serviceCatId}
                  onChange={(e) => setFormData({ ...formData, serviceCatId: e.target.value })}
                  placeholder="Enter service category ID"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCategoryName" className="text-sm font-medium text-gray-700">
                  Category Name
                </Label>
                <Input
                  id="editCategoryName"
                  type="text"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  placeholder="Enter category name"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-colors duration-200"
                >
                  Update Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ServiceCategoryTable;
