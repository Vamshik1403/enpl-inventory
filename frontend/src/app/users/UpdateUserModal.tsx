import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

interface Department {
  id: number;
  departmentName: string;
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  emailId: string;
  userType: string;
  departments: Department[];
}

interface UpdateUserModalProps {
  show: boolean;
  onHide: () => void;
  userId: string;
  fetchUsers: () => void;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({
  show,
  onHide,
  userId,
  fetchUsers,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [emailId, setEmailId] = useState<string>("");
  const [userType, setUserType] = useState<string>("");
  const [departmentIds, setDepartmentIds] = useState<number[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments for selection
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:8000/departments");
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch existing user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await axios.get(`http://localhost:8000/users/${userId}`);
          const userData = response.data;
          setUser(userData);
          setUsername(userData.username);
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
          setContactNumber(userData.contactNumber);
          setEmailId(userData.emailId);
          setUserType(userData.userType);
          setDepartmentIds(userData.departments?.map((d: Department) => d.id) || []);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    if (show) {
      fetchUserData();
    }
  }, [userId, show]);

  // Handle department selection
  const handleCheckboxChange = (id: number) => {
    setDepartmentIds((prev) =>
      prev.includes(id) ? prev.filter((deptId) => deptId !== id) : [...prev, id]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = {
        username,
        firstName,
        lastName,
        contactNumber,
        emailId,
        departmentIds, // Send selected department IDs
      };

      await axios.put(`http://localhost:8000/users/${userId}`, updatedUser);
      fetchUsers();
      onHide();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity ${
        show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Update User</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onHide}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailId">Email ID</Label>
              <Input
                id="emailId"
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Departments</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-300 rounded-lg">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`dept-${dept.id}`}
                    value={dept.id}
                    checked={departmentIds.includes(dept.id)}
                    onChange={() => handleCheckboxChange(dept.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`dept-${dept.id}`} className="text-sm text-gray-700">
                    {dept.departmentName}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onHide}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Update User
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateUserModal;
