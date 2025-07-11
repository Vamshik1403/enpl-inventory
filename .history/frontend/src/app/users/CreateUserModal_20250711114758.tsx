import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

interface CreateUserModalProps {
  show: boolean;
  onHide: () => void;
  fetchUsers: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  show,
  onHide,
  fetchUsers,
}) => {
  const [username, setUsername] = useState<string>("");
  const { userId } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [emailId, setEmailId] = useState<string>("");
  const [departmentIds, setDepartmentIds] = useState<number[]>([]); 
  const [departments, setDepartments] = useState<
    { id: number; departmentName: string }[]
  >([]);
  const [userType, setUserType] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://http://192.168.29.167:8000/departments");
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loggedInUserType = localStorage.getItem("userType");
    const loggedInUserId = userId;

    try {
      const loggedInUserField =
        loggedInUserType === "HOD"
          ? { hodId: loggedInUserId }
          : loggedInUserType === "MANAGER"
          ? { managerId: loggedInUserId }
          : {};

      const newUser = {
        username,
        firstName,
        lastName,
        contactNumber,
        emailId,
        departmentIds, 
        userType,
        password,
        ...loggedInUserField,
      };

      await axios.post("http://http://192.168.29.167:8000/users", newUser);
      fetchUsers();
      onHide();
      resetForm();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const resetForm = () => {
    setUsername("");
    setFirstName("");
    setLastName("");
    setContactNumber("");
    setEmailId("");
    setDepartmentIds([]); 
    setUserType("");
    setPassword("");
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = Number(e.target.value);
    setDepartmentIds((prev) =>
      e.target.checked ? [...prev, id] : prev.filter((department) => department !== id)
    );
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
          <h3 className="text-2xl font-bold text-gray-800">Add New User</h3>
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
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter first name"
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
                placeholder="Enter last name"
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
                type="tel"
                placeholder="Enter contact number"
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
                placeholder="Enter email ID"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="EXECUTIVE">EXECUTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            {userType === "HOD" || userType === "MANAGER" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-300 rounded-lg">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`dept-${dept.id}`}
                      value={dept.id}
                      checked={departmentIds.includes(dept.id)}
                      onChange={handleDepartmentChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`dept-${dept.id}`} className="text-sm text-gray-700">
                      {dept.departmentName}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <Select
                value={departmentIds[0]?.toString() || ""}
                onValueChange={(value) => setDepartmentIds([Number(value)])}
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Add User
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateUserModal;
