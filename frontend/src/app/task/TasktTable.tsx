"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Department {
  id: number;
  departmentName: string;
}

interface Service {
  id: number;
  serviceName: string;
}

interface Customer {
  firstName: string;
  id: number;
  customerName: string;
}

interface Site {
  id: number;
  siteName: string;
}

interface Task {
  id?: number;
  departmentId: number;
  serviceId: number;
  customerId: number;
  siteId: number;
  workScope: string;
  proposedDate: string;
  priority: string;
  remark: string;
  status: string;
  hodId: number;
  managerId: number;
  executiveId: number;
  site: Site;
  service: Service;
}

const TaskTable: React.FC = () => {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTermTask, setSearchTermTask] = useState("");
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [executives, setExecutives] = useState<Customer[]>([]);
  const [managers, setManagers] = useState<Customer[]>([]);
  const [hods, setHods] = useState<Customer[]>([]);
  const [formHods, setFormHods] = useState<Customer[]>([]);
  const [formManagers, setFormManagers] = useState<Customer[]>([]);
  const [formExecutive, setFormExecutive] = useState<Customer[]>([]);
  const [formServices, setFormServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Task>({
    departmentId: 0,
    serviceId: 0,
    customerId: 0,
    siteId: 0,
    workScope: "",
    proposedDate: "",
    priority: "Low",
    remark: "",
    status: "Open",
    hodId: 0,
    managerId: 0,
    executiveId: 0,
    site: { id: 0, siteName: "" },
    service: { id: 0, serviceName: "" },
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchTasks = async () => {
    const userId = localStorage.getItem("userId");
    const userType = localStorage.getItem("userType");

    try {
      let response;
      if (userType === "SUPERADMIN") {
        response = await axios.get("http://localhost:8000/tasks");
      } else {
        response = await axios.get(
          `http://localhost:8000/tasks/user/${userId}`
        );
      }

      if (response.data && Array.isArray(response.data)) {
        setTasks(response.data.reverse());
      } else {
        setTasks([]);
      }
    } catch (error) {
      setTasks([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/departments"
      );
      console.log("Departments fetched:", response.data);
      setDepartments(response.data);
    } catch (error) {
      console.log("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  const fetchExecutives = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/users/executives"
      );
      setExecutives(response.data);
    } catch (error) {
      console.log("Error fetching executives:", error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/users/managers"
      );
      setManagers(response.data);
    } catch (error) {
      console.log("Error fetching managers:", error);
    }
  };

  const fetchHodsByDepartment = async (departmentName: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/users/hods/${departmentName}`
      );
      setFormHods(response.data);
    } catch (error) {
      console.log("Error fetching HODs:", error);
      setFormHods([]);
    }
  };

  const fetchManagersByDepartment = async (departmentName: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/users/manager/${departmentName}`
      );
      setFormManagers(response.data);
    } catch (error) {
      console.log("Error fetching Managers:", error);
      setFormManagers([]);
    }
  };

  const fetchExecutivesByDepartment = async (departmentName: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/users/executive/${departmentName}`
      );
      setFormExecutive(response.data);
    } catch (error) {
      console.log("Error fetching Executives:", error);
      setFormExecutive([]);
    }
  };

  const fetchServicesByDepartment = async (departmentId: number) => {
    try {
      console.log("Fetching services for department ID:", departmentId);
      const response = await axios.get(
        `http://localhost:8000/tasks/services/${departmentId}`
      );
      console.log("Services response:", response.data);
      
      if (response.data && response.data.length > 0) {
        setFormServices(response.data);
      } else {
        // If no department-specific services found, try fetching all services
        console.log("No services found for department, fetching all services");
        const allServicesResponse = await axios.get("http://localhost:8000/service");
        console.log("All services response:", allServicesResponse.data);
        setFormServices(allServicesResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      // Fallback to fetch all services if department-specific fetch fails
      try {
        console.log("Trying to fetch all services as fallback");
        const allServicesResponse = await axios.get("http://localhost:8000/service");
        console.log("Fallback services response:", allServicesResponse.data);
        setFormServices(allServicesResponse.data || []);
      } catch (fallbackError) {
        console.error("Error fetching fallback services:", fallbackError);
        setFormServices([]);
      }
    }
  };

  const fetchAllServices = async () => {
    try {
      const response = await axios.get("http://localhost:8000/service");
      console.log("All services fetched:", response.data);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching all services:", error);
      return [];
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/customers");
      console.log("Customers fetched:", response.data);
      setCustomers(response.data);
    } catch (error) {
      console.log("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  const fetchSitesByCustomer = async (customerId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/sites/customer/${customerId}`
      );
      setSites(response.data);
    } catch (error) {
      console.log("Error fetching sites:", error);
      setSites([]);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/tasks/${id}`);
      setAlert({ type: 'success', message: 'Task deleted successfully!' });
      fetchTasks();
    } catch (error) {
      console.log("Error deleting task:", error);
      setAlert({ type: 'error', message: 'Failed to delete task.' });
    }
  };

  const fetchAllHods = async () => {
    try {
      const response = await axios.get("http://localhost:8000/users/hods");
      console.log("All HODs fetched:", response.data);
      setHods(response.data);
    } catch (error) {
      console.log("Error fetching all HODs:", error);
      setHods([]);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.departmentId || !formData.serviceId) {
        setAlert({ type: 'error', message: 'Please select a valid department and service.' });
        return;
      }

      const sanitizedData = {
        ...formData,
        proposedDate: new Date(formData.proposedDate).toISOString(),
        site: undefined,
        service: undefined,
        managerId: formData.managerId || null,
        executiveId: formData.executiveId || null,
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:8000/tasks/${formData.id}`,
          sanitizedData
        );
        setAlert({ type: 'success', message: 'Task updated successfully!' });
      } else {
        await axios.post("http://localhost:8000/tasks", sanitizedData);
        setAlert({ type: 'success', message: 'Task created successfully!' });
      }

      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      setAlert({ type: 'error', message: 'An error occurred while saving the task.' });
    }
  };

  // Function to format date for HTML input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch {
      return "";
    }
  };

  const openModal = async (task: Task | null = null) => {
    console.log("Opening modal...");
    console.log("Available departments:", departments);
    console.log("Available customers:", customers);
    console.log("Available HODs:", hods);
    console.log("Available managers:", managers);
    console.log("Available executives:", executives);
    
    setIsEditing(!!task);

    if (task) {
      setFormData({
        ...task,
        proposedDate: formatDateForInput(task.proposedDate), // Format the date properly
      });
      const departmentName =
        departments.find((dept) => dept.id === task.departmentId)
          ?.departmentName || "";

      // Clear services first, then fetch new ones
      setFormServices([]);
      if (task.departmentId) {
        await fetchServicesByDepartment(task.departmentId);
      }

      if (departmentName) {
        fetchHodsByDepartment(departmentName);
        fetchManagersByDepartment(departmentName);
        fetchExecutivesByDepartment(departmentName);
      }

      if (task.customerId) {
        fetchSitesByCustomer(task.customerId);
      }
    } else {
      setFormData({
        departmentId: 0,
        serviceId: 0,
        customerId: 0,
        siteId: 0,
        workScope: "",
        proposedDate: "",
        priority: "Low",
        remark: "",
        status: "Open",
        hodId: 0,
        managerId: 0,
        executiveId: 0,
        site: { id: 0, siteName: "" },
        service: { id: 0, serviceName: "" },
      });
      // Initialize with all available data for new task
      setFormServices([]);
      setFormHods(hods); // Use all available HODs initially
      setFormManagers(managers); // Use all available managers initially  
      setFormExecutive(executives); // Use all available executives initially
      setSites([]);
      
      console.log("Loading all services for new task...");
      // Load all services initially for new task
      const allServices = await fetchAllServices();
      console.log("Services loaded:", allServices);
      setFormServices(allServices);
    }

    setIsModalOpen(true);
  };

  const handleDepartmentChange = async (
    departmentId: number,
    departmentName: string
  ) => {
    console.log("Department changed:", departmentId, departmentName);
    setFormData({
      ...formData,
      departmentId,
      serviceId: 0, // Reset service when department changes
      hodId: 0,
      managerId: 0,
      executiveId: 0,
    });
    // Clear services first, then fetch new ones
    setFormServices([]);
    
    // Wait for services to be fetched
    await fetchServicesByDepartment(departmentId);
    fetchHodsByDepartment(departmentName);
    fetchManagersByDepartment(departmentName);
    fetchExecutivesByDepartment(departmentName);
  };

  const handleCustomerChange = (customerId: number) => {
    setFormData({ ...formData, customerId, siteId: 0 });
    fetchSitesByCustomer(customerId);
  };

  useEffect(() => {
    if (userId) {
      fetchTasks();
      fetchDepartments();
      fetchCustomers();
      fetchExecutives();
      fetchManagers();
      fetchAllHods();
      fetchAllServices(); // Fetch all services initially
    }
  }, [userId]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const filteredTasks = tasks.filter((task) => {
    const department = departments.find((dept) => dept.id === task.departmentId)?.departmentName?.toLowerCase() || "";
    const service = task.service?.serviceName?.toLowerCase() || "";
    const workScope = task.workScope?.toLowerCase() || "";
    const customer = customers.find((cust) => cust.id === task.customerId)?.customerName?.toLowerCase() || "";
    const site = task.site?.siteName?.toLowerCase() || "";
    const hod = hods.find((h) => h.id === task.hodId)?.firstName?.toLowerCase() || "";
    const manager = managers.find((m) => m.id === task.managerId)?.firstName?.toLowerCase() || "";
    const executive = executives.find((e) => e.id === task.executiveId)?.firstName?.toLowerCase() || "";
  
    return (
      department.includes(searchTermTask.toLowerCase()) ||
      service.includes(searchTermTask.toLowerCase()) ||
      workScope.includes(searchTermTask.toLowerCase()) ||
      customer.includes(searchTermTask.toLowerCase()) ||
      site.includes(searchTermTask.toLowerCase()) ||
      hod.includes(searchTermTask.toLowerCase()) ||
      manager.includes(searchTermTask.toLowerCase()) ||
      executive.includes(searchTermTask.toLowerCase())
    );
  });
  

  return (
    <div className="flex h-screen mt-3">
      <div className="flex-1 p-6 overflow-auto">
        {alert && (
          <Alert className={`mb-4 ${alert.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <AlertDescription className={alert.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6"
        >
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={async () => await openModal()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-center">
                {isEditing ? "Edit Task" : "Add Task"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.departmentId ? formData.departmentId.toString() : ""}
                  onValueChange={async (value) => {
                    const departmentId = parseInt(value, 10);
                    const departmentName =
                      departments.find((dept) => dept.id === departmentId)
                        ?.departmentName || "";
                    await handleDepartmentChange(departmentId, departmentName);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id.toString()}>
                        {department.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select
                  value={formData.serviceId ? formData.serviceId.toString() : ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      serviceId: parseInt(value, 10),
                    })
                  }
                  disabled={formServices.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formServices.length === 0 ? "No services available" : "Select Service"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formServices.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.serviceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={formData.customerId ? formData.customerId.toString() : ""}
                  onValueChange={(value) =>
                    handleCustomerChange(parseInt(value, 10))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Select
                  value={formData.siteId ? formData.siteId.toString() : ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      siteId: parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.siteName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workScope">WorkScope</Label>
                <Textarea
                  id="workScope"
                  value={formData.workScope || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, workScope: e.target.value })
                  }
                  placeholder="WorkScope"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposedDate">Proposed Date</Label>
                <Input
                  id="proposedDate"
                  type="date"
                  value={formData.proposedDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, proposedDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hod">HOD</Label>
                <Select
                  value={formData.hodId ? formData.hodId.toString() : ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      hodId: parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HOD" />
                  </SelectTrigger>
                  <SelectContent>
                    {formHods.map((hod) => (
                      <SelectItem key={hod.id} value={hod.id.toString()}>
                        {hod.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Select
                  value={formData.managerId ? formData.managerId.toString() : ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      managerId: parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Manager" />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    {formManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="executive">Executive</Label>
                <Select
                  value={formData.executiveId ? formData.executiveId.toString() : ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      executiveId: parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Executive" />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    {formExecutive.map((executive) => (
                      <SelectItem key={executive.id} value={executive.id.toString()}>
                        {executive.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remark">Remark</Label>
                <Textarea
                  id="remark"
                  value={formData.remark || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                  placeholder="Remark"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "Open"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTermTask}
              onChange={(e) => setSearchTermTask(e.target.value)}
              className="pl-10 pr-4 py-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </motion.div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <TableHead className="font-semibold text-gray-700">Department</TableHead>
                    <TableHead className="font-semibold text-gray-700">Service</TableHead>
                    <TableHead className="font-semibold text-gray-700">WorkScope</TableHead>
                    <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                    <TableHead className="font-semibold text-gray-700">Site</TableHead>
                    <TableHead className="font-semibold text-gray-700">Proposed Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">HOD</TableHead>
                    <TableHead className="font-semibold text-gray-700">Manager</TableHead>
                    <TableHead className="font-semibold text-gray-700">Executive</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTasks.length > 0 ? (
                    filteredTasks
                      .sort((a, b) => {
                        const dateA = a.proposedDate ? new Date(a.proposedDate).getTime() : 0;
                        const dateB = b.proposedDate ? new Date(b.proposedDate).getTime() : 0;
                        return dateB - dateA;
                      })
                      .map((task) => (
                        <TableRow
                          key={task.id}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <TableCell className="font-medium">
                            {departments.find((dept) => dept.id === task.departmentId)?.departmentName}
                          </TableCell>
                          <TableCell>{task.service?.serviceName || "No Service"}</TableCell>
                          <TableCell>{task.workScope || "No WorkScope"}</TableCell>
                          <TableCell>
                            {customers.find((customer) => customer.id === task.customerId)?.customerName}
                          </TableCell>
                          <TableCell>{task.site?.siteName || "No Service"}</TableCell>
                          <TableCell>
                            {task.proposedDate
                              ? new Date(task.proposedDate).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                })
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {hods.find((hod) => hod.id === task.hodId)?.firstName || "N/A"}
                          </TableCell>
                          <TableCell>
                            {managers.find((manager) => manager.id === task.managerId)?.firstName || "N/A"}
                          </TableCell>
                          <TableCell>
                            {executives.find((executive) => executive.id === task.executiveId)?.firstName || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={async () => await openModal(task)}
                                variant="outline"
                                size="sm"
                                className="hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 transform hover:scale-105"
                              >
                                <Edit className="h-4 w-4 text-yellow-600" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(task.id!)}
                                variant="outline"
                                size="sm"
                                className="hover:bg-red-50 hover:border-red-300 transition-all duration-200 transform hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center p-8 text-gray-500">
                        No tasks available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mt-6 space-x-2"
        >
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 transition-all duration-200"
          >
            Previous
          </Button>
          
          {[...Array(Math.ceil(tasks.length / itemsPerPage))].map((_, index) => (
            <Button
              key={index}
              onClick={() => paginate(index + 1)}
              variant={currentPage === index + 1 ? "default" : "outline"}
              size="sm"
              className={`transition-all duration-200 ${
                currentPage === index + 1 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "hover:bg-blue-50"
              }`}
            >
              {index + 1}
            </Button>
          ))}
          
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(tasks.length / itemsPerPage)}
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 transition-all duration-200"
          >
            Next
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskTable;
