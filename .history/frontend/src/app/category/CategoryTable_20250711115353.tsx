"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSearch, FaTrashAlt } from "react-icons/fa";
import { Package, Plus, Edit3, Trash2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubCategory {
  id: number;
  subCategoryName: string;
}

interface Category {
  id: number;
  categoryName: string;
  categoryId: string;
  subCategories: SubCategory[];
}

const CategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Category; direction: "asc" | "desc" } | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState({
    categoryName: "",
    categoryId: "",
    subCategories: [{ subCategoryName: "" }],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(""), 3000);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://192.168.0.102:8000/category");
      setCategories(response.data.reverse());
    } catch (error) {
      console.error("Error fetching categories:", error);
      showAlert("Error fetching categories", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://192.168.0.102:8000/category/${id}`);
        showAlert("Category deleted successfully!", "success");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        showAlert(
          "Failed to delete category. Ensure there are no dependent entries.",
          "error"
        );
      }
    }
  };

  const handleCreate = async () => {
    const { categoryName } = formData;

    if (!categoryName) {
      showAlert("Please fill in all required fields.", "error");
      return;
    }

    try {
      await axios.post("http://192.168.0.102:8000/category", {
        categoryName: formData.categoryName,
        categoryId: formData.categoryId,
        subCategories: formData.subCategories,
      });
      showAlert("Category created successfully!", "success");
      setIsCreateModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      showAlert("Error creating category", "error");
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;

    try {
      await axios.put(`http://192.168.0.102:8000/category/${selectedCategory.id}`, {
        categoryName: formData.categoryName,
        categoryId: String(formData.categoryId), // ensure it's a string
        subCategories: formData.subCategories,
      });
      showAlert("Category updated successfully!", "success");
      setIsUpdateModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      showAlert("Failed to update category.", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.categoryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subCategories.some((subCategory) =>
        subCategory.subCategoryName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
  );
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (!sortConfig) return 0;
    const key = sortConfig.key;
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    return a[key].toString().localeCompare(b[key].toString()) * direction;
  });

  const requestSort = (key: keyof Category) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentCategories = sortedCategories.slice(indexOfFirstUser, indexOfLastUser);


  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);





  return (
    <div className="w-full space-y-6">
      {/* Alert */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className={`${alertType === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
              <AlertDescription className={`${alertType === "success" ? "text-green-700" : "text-red-700"}`}>
                {alertMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Add Button and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Package className="text-2xl text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                setIsCreateModalOpen(true);
                setFormData({
                  categoryName: "",
                  categoryId: "",
                  subCategories: [{ subCategoryName: "" }],
                });
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </motion.div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                  <TableHead 
                    className="text-center cursor-pointer select-none font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => requestSort("categoryId")}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Category ID</span>
                      {sortConfig?.key === "categoryId" && (
                        <span className="text-indigo-600">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer select-none font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => requestSort("categoryName")}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Category Name</span>
                      {sortConfig?.key === "categoryName" && (
                        <span className="text-indigo-600">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCategories.length > 0 ? (
                  currentCategories.map((category, index) => (
                    <motion.tr
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                    >
                      <TableCell className="text-center font-medium">
                        {category.categoryId}
                      </TableCell>
                      <TableCell className="text-center">
                        {category.categoryName}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center gap-2">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(category);
                                setFormData({
                                  categoryName: category.categoryName,
                                  categoryId: category.categoryId,
                                  subCategories: category.subCategories.map(
                                    (sub) => ({
                                      subCategoryName: sub.subCategoryName,
                                    })
                                  ),
                                });
                                setIsUpdateModalOpen(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                            >
                              <Edit3 size={16} />
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                      No categories available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Previous
        </Button>
        <div className="flex gap-1">
          {Array.from({ length: Math.ceil(categories.length / itemsPerPage) }, (_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => paginate(index + 1)}
              className={`${
                currentPage === index + 1 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(categories.length / itemsPerPage)}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Next
        </Button>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="max-w-md bg-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-800">
                    Add Product Category
                  </DialogTitle>
                  <DialogDescription>
                    Create a new product category
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category ID</Label>
                    <Input
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      placeholder="Category ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      value={formData.categoryName}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryName: e.target.value })
                      }
                      placeholder="Category Name"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleCreate}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      Create
                    </Button>
                  </motion.div>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Update Modal */}
      <AnimatePresence>
        {isUpdateModalOpen && (
          <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
            <DialogContent className="max-w-md bg-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-800">
                    Edit Category
                  </DialogTitle>
                  <DialogDescription>
                    Update category details
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="updateCategoryId">Category ID</Label>
                    <Input
                      id="updateCategoryId"
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      placeholder="Category ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="updateCategoryName">Category Name</Label>
                    <Input
                      id="updateCategoryName"
                      value={formData.categoryName}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryName: e.target.value })
                      }
                      placeholder="Category Name"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsUpdateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleUpdate}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                    >
                      Update
                    </Button>
                  </motion.div>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryTable;
