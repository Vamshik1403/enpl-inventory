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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";

interface SubCategory {
  id: number;
  subCategoryName: string;
  subCategoryId: string;
  categoryId: number;
  category: Category;
}

interface Category {
  id: number;
  categoryId: string;
  categoryName: string;
}

const SubCategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setselectedCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [sortConfig, setSortConfig] = useState<{ key: keyof SubCategory | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });

  const [formData, setFormData] = useState({
    categoryId: 0, // Initially empty
    subCategoryName: "",
    subCategorySuffix: "", // Added for suffix input
    subCategoryId: "",
  });
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(""), 3000);
  };

  // ✅ Fetch categories for the dropdown
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://192.168.29.167:8000/category");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showAlert("Error fetching categories", "error");
    }
  };

  // ✅ Fetch subcategories for the table
  const fetchSubCategories = async () => {
    try {
      const response = await axios.get("http://192.168.29.167:8000/subcategory");
      const filteredSubCategories = response.data.filter(
        (subCategory: SubCategory) =>
          subCategory.category?.categoryName && subCategory.subCategoryName
      );
      setSubCategories(filteredSubCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      showAlert("Error fetching subcategories", "error");
    }
  };

  const handleDelete = async (subCategoryId: number) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await axios.delete(
          `http://192.168.29.167:8000/subcategory/${subCategoryId}`
        );
        showAlert("Subcategory deleted successfully!", "success");
        fetchSubCategories(); // Re-fetch subcategories to update the table
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        showAlert("Failed to delete subcategory.", "error");
      }
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      categoryId: 0,
      subCategoryName: "",
      subCategoryId: "",
      subCategorySuffix: "",
    });
    setIsCreateModalOpen(true);
  };

  // Open Update Modal with selected subcategory details
  const openUpdateModal = (subCategory: SubCategory) => {
    const fullId = subCategory.subCategoryId;
    const categoryCode = subCategory.category.categoryId; // e.g., "MATCH"

    const suffix =
      fullId.startsWith(`${categoryCode}-`) &&
      fullId.length > categoryCode.length + 1
        ? fullId.slice(categoryCode.length + 1) // grab only what's after `${categoryCode}-`
        : "";

    setSelectedSubCategory(subCategory);
    setFormData({
      categoryId: subCategory.category.id,
      subCategoryName: subCategory.subCategoryName,
      subCategoryId: subCategory.subCategoryId,
      subCategorySuffix: suffix,
    });
    setIsUpdateModalOpen(true);
  };

  // ✅ Corrected handleSubmit function for creating or updating subcategories
  const handleSubmit = async () => {
    const { categoryId, subCategoryName, subCategorySuffix } = formData;

    if (!categoryId || !subCategoryName) {
      showAlert("Please select a category and enter a subcategory name.", "error");
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const categoryCode = selectedCategory?.categoryId || "";
    const newSubCategoryId = `${categoryCode}-${subCategorySuffix}`;
    try {
      if (selectedSubCategory) {
        // Updating existing subcategory
        await axios.put(
          `http://192.168.29.167:8000/subcategory/${selectedSubCategory.id}`,
          {
            categoryId,
            subCategoryName,
            subCategoryId: newSubCategoryId,
          }
        );
        showAlert("Subcategory updated successfully!", "success");
      } else {
        // Creating new subcategory
        await axios.post("http://192.168.29.167:8000/subcategory", {
          categoryId,
          subCategoryName,
          subCategoryId: newSubCategoryId,
        });
        showAlert("Subcategory created successfully!", "success");
      }

      fetchSubCategories();
      setIsCreateModalOpen(false);
      setIsUpdateModalOpen(false);
      setFormData({
        categoryId: 0,
        subCategoryName: "",
        subCategoryId: "",
        subCategorySuffix: "",
      });
    } catch (error) {
      console.error("Error handling subcategory:", error);
      showAlert("Failed to create or update subcategory.", "error");
    }
  };

  // ✅ Fetch data when component mounts
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const handleSort = (key: keyof SubCategory) => {
  let direction: "asc" | "desc" = "asc";
  if (sortConfig.key === key && sortConfig.direction === "asc") {
    direction = "desc";
  }
  setSortConfig({ key, direction });
};
  const filteredCategories = subCategories
  .filter(
    (subCategory) =>
      subCategory.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subCategory.category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => {
    if (!sortConfig.key) return 0;

    const getValue = (obj: SubCategory, key: keyof SubCategory) => {
      if (key === "category") return obj.category.categoryName.toLowerCase();
      return (obj[key] as string)?.toString().toLowerCase();
    };

    const aVal = getValue(a, sortConfig.key);
    const bVal = getValue(b, sortConfig.key);

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });


  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentSubcategories = filteredCategories.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

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
          <h1 className="text-2xl font-bold text-gray-800">Sub Category Management</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product Subcategory
            </Button>
          </motion.div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search subcategories..."
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
            Sub Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                  <TableHead 
                    className="text-center cursor-pointer select-none font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => handleSort("subCategoryId")}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Sub Category ID</span>
                      {sortConfig?.key === "subCategoryId" && (
                        <span className="text-indigo-600">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer select-none font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Category Name</span>
                      {sortConfig?.key === "category" && (
                        <span className="text-indigo-600">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer select-none font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => handleSort("subCategoryName")}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Sub Category Name</span>
                      {sortConfig?.key === "subCategoryName" && (
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
                {currentSubcategories.length > 0 ? (
                  currentSubcategories.map((subCategory, index) => (
                    <motion.tr
                      key={subCategory.subCategoryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                    >
                      <TableCell className="text-center font-medium">
                        {subCategory.subCategoryId}
                      </TableCell>
                      <TableCell className="text-center">
                        {subCategory.category.categoryName}
                      </TableCell>
                      <TableCell className="text-center">
                        {subCategory.subCategoryName}
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
                              onClick={() => openUpdateModal(subCategory)}
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
                              onClick={() => handleDelete(subCategory.id)}
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
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No subcategories available.
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
          {Array.from({ length: Math.ceil(filteredCategories.length / itemsPerPage) }, (_, index) => (
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
          disabled={currentPage === Math.ceil(filteredCategories.length / itemsPerPage)}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Next
        </Button>
      </div>

      {/* Create/Update Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || isUpdateModalOpen) && (
          <Dialog open={isCreateModalOpen || isUpdateModalOpen} onOpenChange={() => {
            setIsCreateModalOpen(false);
            setIsUpdateModalOpen(false);
          }}>
            <DialogContent className="max-w-md bg-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-800">
                    {isUpdateModalOpen ? "Edit Subcategory" : "Add Subcategory"}
                  </DialogTitle>
                  <DialogDescription>
                    {isUpdateModalOpen ? "Update subcategory details" : "Create a new subcategory"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Combobox
                      options={categories.map(category => ({
                        label: category.categoryName,
                        value: category.id.toString()
                      }))}
                      value={formData.categoryId ? formData.categoryId.toString() : ""}
                      onChange={(value) => {
                        const selectedCategoryId = parseInt(value);
                        const selectedCategory = categories.find(
                          (c) => c.id === selectedCategoryId
                        );
                        const categoryCode = selectedCategory?.categoryId || "";

                        setFormData((prev) => ({
                          ...prev,
                          categoryId: selectedCategoryId,
                          subCategorySuffix: "",
                          subCategoryId: "",
                        }));
                      }}
                      placeholder="Select Category"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Manual SubCategory ID</Label>
                    <Input
                      placeholder="Enter suffix"
                      value={formData.subCategorySuffix || ""}
                      onChange={(e) => {
                        const suffix = e.target.value.trim().toUpperCase();
                        const selectedCategory = categories.find(
                          (c) => c.id === formData.categoryId
                        );
                        const categoryCode = selectedCategory?.categoryId || "";

                        setFormData((prev) => ({
                          ...prev,
                          subCategorySuffix: suffix,
                          subCategoryId:
                            categoryCode && suffix
                              ? `${categoryCode}-${suffix}`
                              : "",
                        }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Generated Subcategory ID</Label>
                    <Input
                      value={formData.subCategoryId || ""}
                      readOnly
                      className="bg-gray-50"
                      placeholder="Auto-generated ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subcategory Name</Label>
                    <Input
                      placeholder="Enter Subcategory Name"
                      value={formData.subCategoryName || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subCategoryName: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsUpdateModalOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSubmit}
                      className={`${
                        isUpdateModalOpen 
                          ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700"
                          : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                      }`}
                    >
                      {isUpdateModalOpen ? "Update Subcategory" : "Create Subcategory"}
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

export default SubCategoryTable;
