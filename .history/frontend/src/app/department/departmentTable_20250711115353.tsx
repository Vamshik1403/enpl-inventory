"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { PencilLine, Trash, Plus, Building } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
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

interface Department {
  id: number;
  departmentName: string;
}

const DepartmentTable: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});
  const [formData, setFormData] = useState<Department>({
    id: 0,
    departmentName: "",
  });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://192.168.0.102:8000/departments");
      setDepartments(response.data.reverse());
    } catch (error) {
      console.error("Error fetching departments:", error);
      setAlert({type: 'error', message: 'Failed to fetch departments'});
    } finally {
      setLoading(false);
    }
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({type, message});
    setTimeout(() => setAlert({type: null, message: ''}), 3000);
  };

  const handleAdd = async () => {
    if (!formData.departmentName.trim()) {
      showAlert('error', 'Department name is required!');
      return;
    }

    try {
      await axios.post("http://192.168.0.102:8000/departments", formData);
      showAlert('success', 'Department added successfully!');
      setIsModalOpen(false);
      fetchDepartments();
      setFormData({id: 0, departmentName: ""});
    } catch (error) {
      console.error("Error adding department:", error);
      showAlert('error', 'Failed to add department');
    }
  };

  const handleUpdate = async () => {
    if (!formData.departmentName.trim()) {
      showAlert('error', 'Department name is required!');
      return;
    }

    try {
      await axios.put(
        `http://192.168.0.102:8000/departments/${formData.id}`,
        formData
      );
      showAlert('success', 'Department updated successfully!');
      setIsModalOpen(false);
      fetchDepartments();
      setFormData({id: 0, departmentName: ""});
    } catch (error) {
      console.error("Error updating department:", error);
      showAlert('error', 'Failed to update department');
    }
  };

  const handleDelete = useCallback(
    async (id: number) => {
      if (window.confirm("Are you sure you want to delete this department?")) {
        try {
          await axios.delete(`http://192.168.0.102:8000/departments/${id}`);
          showAlert('success', 'Department deleted successfully!');
          fetchDepartments();
        } catch (error) {
          console.error("Error deleting department:", error);
          showAlert('error', 'Failed to delete department');
        }
      }
    },
    [fetchDepartments]
  );

  const openModal = (department?: Department) => {
    if (department) {
      setFormData(department);
      setIsEditing(true);
    } else {
      setFormData({ id: 0, departmentName: "" });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: 0, departmentName: "" });
    setIsEditing(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return (
    <div className="w-full space-y-6">
      {/* Alert Messages */}
      <AnimatePresence>
        {alert.type && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className={`${alert.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <AlertDescription className={alert.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {alert.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Building className="text-2xl text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </motion.div>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Department List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} height={40} className="rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                    <TableHead className="text-center font-semibold text-gray-700">ID</TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">Department Name</TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {departments.map((department, index) => (
                      <motion.tr
                        key={department.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                      >
                        <TableCell className="text-center font-medium">
                          {department.id}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-gray-800">
                            {department.departmentName}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openModal(department)}
                                className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-colors duration-200"
                              >
                                <PencilLine className="h-3 w-3" />
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(department.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-colors duration-200"
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </motion.div>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-indigo-600 flex items-center">
              <Building className="mr-2" />
              {isEditing ? "Edit Department" : "Add Department"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isEditing 
                ? "Update the department information below." 
                : "Create a new department by entering the details below."
              }
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="departmentName" className="text-sm font-medium text-gray-700">
                Department Name
              </Label>
              <Input
                id="departmentName"
                value={formData.departmentName}
                onChange={(e) =>
                  setFormData({ ...formData, departmentName: e.target.value })
                }
                placeholder="Enter department name"
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </motion.div>
          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={closeModal}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={isEditing ? handleUpdate : handleAdd}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                {isEditing ? "Update" : "Save"}
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentTable;
