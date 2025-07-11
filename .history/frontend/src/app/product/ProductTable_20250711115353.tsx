"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateProductModal from "./CreateProductModal";
import UpdateProductModal from "./UpdateProductModal";
import Papa from "papaparse";
import { FaDownload, FaEdit, FaSearch, FaTrashAlt } from "react-icons/fa";
import { Package, Plus, Edit3, Trash2, Search, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  id: string;
  productId: string;
  productName: string;
  productDescription: string;
  HSN: string;
  categoryId: number;
  subCategoryId: string;
}

interface Category {
  id: number;
  categoryName: string;
  subCategoryName: string;
}

const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<keyof Product | "category" | "subCategory">("productName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(""), 3000);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://192.168.0.102:8000/products");
      setProducts(response.data.reverse());
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlert("Error fetching products", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://192.168.0.102:8000/category");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showAlert("Error fetching categories", "error");
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get("http://192.168.0.102:8000/subcategory");
      setSubCategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      showAlert("Error fetching subcategories", "error");
    }
  };

  const handleDownloadCSV = () => {
    if (products.length === 0) return;

    const csv = Papa.unparse(
      products.map(
        ({
          id,
          productId,
          productName,
          productDescription,
          HSN,
          categoryId,
          subCategoryId,
        }) => ({
          ID: id,
          ProductID: productId,
          ProductName: productName,
          ProductDescription: productDescription,
          HSN,
          Category: getCategoryName(categoryId),
          SubCategory: getSubCategoryName(subCategoryId),
        })
      )
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setSelectedProductId(product.id);
    setShowUpdateModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) {
      return;
    }
    try {
      await axios.delete(`http://192.168.0.102:8000/products/${id}`);
      showAlert("Product deleted successfully!", "success");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showAlert("Error deleting product", "error");
    }
  };

  const getCategoryName = (id: number): string => {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.categoryName : "Unknown";
  };

  const getSubCategoryName = (id: string): string => {
    const subCategory = subCategories.find(
      (subCat) => subCat.id === Number(id)
    );
    return subCategory ? subCategory.subCategoryName : "Unknown";
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubCategories();
  }, []);

  // 1. Filter products based on searchTerm
const filteredProducts = products.filter((product) =>
  product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
  product.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
);

// 2. Sort the filtered products
const sortedProducts = [...filteredProducts].sort((a, b) => {
  let aField: string | number = a[sortField as keyof Product] ?? "";
  let bField: string | number = b[sortField as keyof Product] ?? "";

  if (sortField === "category") {
    aField = getCategoryName(a.categoryId);
    bField = getCategoryName(b.categoryId);
  }

  if (sortField === "subCategory") {
    aField = getSubCategoryName(a.subCategoryId);
    bField = getSubCategoryName(b.subCategoryId);
  }

  const result =
    typeof aField === "string"
      ? aField.localeCompare(String(bField))
      : (aField as number) - (bField as number);

  return sortOrder === "asc" ? result : -result;
});

// 3. Paginate the sorted + filtered products
const indexOfLastUser = currentPage * itemsPerPage;
const indexOfFirstUser = indexOfLastUser - itemsPerPage;
const currentProducts = sortedProducts.slice(indexOfFirstUser, indexOfLastUser);

const handleSort = (field: keyof Product | "category" | "subCategory") => {
  if (field === sortField) {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  } else {
    setSortField(field);
    setSortOrder("asc");
  }
};

  


  

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
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </motion.div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Download className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                  {[
                    { label: "Product ID", key: "productId" },
                    { label: "Product Name", key: "productName" },
                    { label: "Product Description", key: "productDescription" },
                    { label: "HSN", key: "HSN" },
                    { label: "Category", key: "category" },
                    { label: "Sub Category", key: "subCategory" },
                    { label: "Actions", key: "" },
                  ].map((col) => (
                    <TableHead
                      key={col.key}
                      className={`text-center font-semibold text-gray-700 ${
                        col.key ? "cursor-pointer select-none hover:text-indigo-600 transition-colors" : ""
                      }`}
                      onClick={() => col.key && handleSort(col.key as keyof Product | "category" | "subCategory")}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>{col.label}</span>
                        {col.key && sortField === col.key && (
                          <span className="text-indigo-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                  >
                    <TableCell className="text-center font-medium">
                      {product.productId}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.productName}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.productDescription}
                    </TableCell>
                    <TableCell className="text-center">{product.HSN}</TableCell>
                    <TableCell className="text-center">
                      {getCategoryName(product.categoryId)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getSubCategoryName(product.subCategoryId)}
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
                            onClick={() => handleEdit(product)}
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
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </motion.div>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
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
          {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, index) => (
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
          disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Next
        </Button>
      </div>

      <CreateProductModal
        show={isCreateModalOpen}
        onHide={() => setIsCreateModalOpen(false)}
        fetchProducts={fetchProducts}
      />

      {showUpdateModal && selectedProduct && (
        <UpdateProductModal
          show={showUpdateModal}
          onHide={() => setShowUpdateModal(false)}
          productId={selectedProductId}
          fetchProducts={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductTable;
