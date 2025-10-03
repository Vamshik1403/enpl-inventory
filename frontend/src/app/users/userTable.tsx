"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateUserModal from "./CreateUserModal";
import UpdateUserModal from "./UpdateUserModal";
import { Edit, Trash2, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  emailId: string;
  departments: Department[];
  userType: string;
}

interface Department {
  id: number;
  departmentName: string;
}

  const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; 

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/users");
      setUsers(response.data.reverse());
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:8000/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/users/${id}`);
      setAlert({ type: 'success', message: 'User deleted successfully!' });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setAlert({ type: 'error', message: 'Failed to delete user.' });
    }
  };

  const handleEdit = (userId: string) => {
    setSelectedUserId(userId);
    setShowUpdateModal(true);
  };

  const getDepartmentName = (departments: Department[]) => {
    return departments.length > 0
      ? departments.map((dept) => dept.departmentName).join(", ")
      : "Unknown";
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Pagination logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex-1 p-6 bg-white min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <Users className="text-2xl text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            </div>
            
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-4 rounded-lg text-white ${
                alert.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {alert.message}
            </motion.div>
          )}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-3 font-semibold text-gray-700">Username</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-gray-700">Department</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-gray-700">User Type</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers
                  .filter((user) => user.username !== "admin")
                  .map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="px-4 py-3 font-medium">{user.username}</TableCell>
                      <TableCell className="px-4 py-3">
                        {user.departments.length > 0
                          ? getDepartmentName(user.departments)
                          : "Loading..."}
                      </TableCell>
                      <TableCell className="px-4 py-3">{user.userType}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user.id)}
                            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-colors duration-200"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
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

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1} to{" "}
              {Math.min(indexOfLastUser, users.length)} of{" "}
              {users.length} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="px-3 py-1"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(Math.ceil(users.length / itemsPerPage), 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      onClick={() => paginate(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="px-3 py-1"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(users.length / itemsPerPage)}
                variant="outline"
                size="sm"
                className="px-3 py-1"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <CreateUserModal
        show={isCreateModalOpen}
        onHide={() => setIsCreateModalOpen(false)}
        fetchUsers={fetchUsers}
      />
      {showUpdateModal && (
        <UpdateUserModal
          show={showUpdateModal}
          onHide={() => setShowUpdateModal(false)}
          userId={selectedUserId}
          fetchUsers={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserTable;
