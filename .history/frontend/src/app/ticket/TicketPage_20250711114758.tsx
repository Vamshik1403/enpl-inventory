"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import { AppSidebarLayout } from "../components/app-sidebar";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import { SimpleCustomerSelect } from "@/components/ui/SimpleCustomerSelect";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Reply, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Tag, 
  AlertCircle, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  PlayCircle,
  RotateCcw,
  XCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Customer {
  id: number;
  customerName: string;
}

interface Site {
  id: number;
  siteName: string;
  customerId: number;
}

type Ticket = {
  id: number;
  ticketId: string;
  title: string;
  description: string;
  customerId: number;
  siteId: number;
  status: string;
  createdAt: string;
  createdById: number;
  assignedToId: number | null;
  categoryName: string;
  subCategoryName: string;
  serviceCategoryName: string[];
  contactPerson: string;
  mobileNo: number;
  proposedDate?: string;
  priority: string;
  manCustm?: string;
  manSite?: string;
  customer?: {
    id: number;
    customerName: string;
  };
  site?: {
    id: number;
    siteName: string;
  }
};

type Message = {
  id: number;
  content: string;
  senderId: number;
  sender?: {
    id: number;
    username: string;
  };
  ticketId: number;
  createdAt: string;
  status?: string;
};

export default function TicketPage() {
  const { userId, userType } = useAuth();
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);  
  const [sites, setSites] = useState<Site[]>([]); 
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [form, setForm] = useState({
    customerId: 0,
    siteId: 0,
    title: "",
    description: "",
    categoryName: "",
    subCategoryName: "",
    serviceCategoryName: [] as string[],
    contactPerson: "",
    mobileNo: "",
    proposedDate: "",
    priority: "",
    manCustm: "",
    manSite: "",
  });

  // Chat scroll reference for auto-scroll functionality
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const headers = [
    { label: "Creation Date", key: "createdAt" },
    { label: "Support Ticket ID", key: "ticketId" },
    { label: "Category", key: "categoryName" },
    { label: "Sub Category", key: "subCategoryName" },
    { label: "Customer Name", key: "customerName" },
    { label: "Site Name", key: "siteName" },
    { label: "Proposed Date & Time", key: "proposedDate" },
    { label: "Priority", key: "priority" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subCategoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || ticket.categoryName === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const sortedTickets = React.useMemo(() => {
    if (!sortField) return filteredTickets;

    return [...filteredTickets].sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortField === "customerName") {
        aValue = getCustomerName(a);
        bValue = getCustomerName(b);
      } else if (sortField === "siteName") {
        aValue = getSiteName(a);
        bValue = getSiteName(b);
      } else {
        aValue = a[sortField as keyof Ticket] ?? "";
        bValue = b[sortField as keyof Ticket] ?? "";
      }

      if (sortField.toLowerCase().includes("date")) {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      return sortOrder === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filteredTickets, sortField, sortOrder, customers, allSites]);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = sortedTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(sortedTickets.length / ticketsPerPage);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      
      if (!userId) {
        setTickets([]);
        return;
      }
      
      // The backend already handles admin vs user logic in the /user/:userId endpoint
      // For SUPERADMIN: returns all tickets
      // For regular users: returns only their tickets (created by them OR assigned to them)
      const endpoint = `http://http://192.168.29.167:8000/tickets/user/${userId}`;
      const response = await axios.get(endpoint);
      
      if (response.data) {
        const ticketsData = Array.isArray(response.data) ? response.data : [];
        
        // Sort by creation date (newest first)
        const sortedTickets = ticketsData.sort((a: Ticket, b: Ticket) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setTickets(sortedTickets);
      } else {
        setTickets([]);
      }
    } catch (error: any) {
      toast.error("Failed to load tickets. Please check your connection and try again.");
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://http://192.168.29.167:8000/customers");
      setCustomers(res.data);
    } catch (error) {
      // Silent error handling - will show no data if fetch fails
    }
  };

  const fetchAllSites = async () => {
    try {
      const response = await axios.get("http://http://192.168.29.167:8000/sites");
      setAllSites(response.data);
    } catch (error) {
      // Silent error handling - will show no data if fetch fails
    }
  };

  const fetchTicketDetails = async (id: number) => {
    try {
      setIsRefreshing(true);
      const res = await axios.get(`http://http://192.168.29.167:8000/tickets/${id}`);
      setSelectedTicket(res.data);
      const msgRes = await axios.get(`http://http://192.168.29.167:8000/message/${id}`);
      setMessages(msgRes.data);
    } catch (error) {
      // Silent error handling - will show no data if fetch fails
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      if (userId) {
        const response = await axios.get(`http://http://192.168.29.167:8000/users/${userId}`);
        setCurrentUser(response.data);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.title.trim()) {
      toast.error("Please enter a ticket subject");
      return;
    }
    
    if (!form.description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    
    if (!form.categoryName) {
      toast.error("Please select a category");
      return;
    }
    
    if (!form.subCategoryName) {
      toast.error("Please select a subcategory");
      return;
    }
    
    try {
      const ticketData: any = {
        title: form.title,
        description: form.description,
        categoryName: form.categoryName,
        subCategoryName: form.subCategoryName,
        priority: form.priority,
        createdBy: Number(userId),
        // assignedTo is now optional - admin can assign later
      };

      // Add optional fields only if they have values
      if (form.proposedDate) {
        ticketData.proposedDate = form.proposedDate;
      }
      
      if (form.serviceCategoryName.length > 0) {
        ticketData.serviceCategoryName = form.serviceCategoryName.join(",");
      }
      
      if (form.customerId > 0) {
        ticketData.customerId = Number(form.customerId);
      }
      
      if (form.siteId > 0) {
        ticketData.siteId = Number(form.siteId);
      }
      
      if (form.manCustm) {
        ticketData.manCustm = form.manCustm;
      }
      
      if (form.manSite) {
        ticketData.manSite = form.manSite;
      }
      
      if (form.contactPerson) {
        ticketData.contactPerson = form.contactPerson;
      }
      
      if (form.mobileNo) {
        ticketData.mobileNo = form.mobileNo;
      }
      
      await axios.post("http://http://192.168.29.167:8000/tickets", ticketData);
      setTicketModalOpen(false);
      
      // Immediately refresh tickets list
      await fetchTickets();
      
      toast.success("Support ticket created successfully!");
      setForm({
        customerId: 0,
        siteId: 0,
        title: "",
        description: "",
        categoryName: "",
        subCategoryName: "",
        serviceCategoryName: [],
        contactPerson: "",
        mobileNo: "",
        proposedDate: "",
        priority: "",
        manCustm: "",
        manSite: "",
      });
    } catch (error: any) {
      // Show more detailed error message to the user
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          // Validation errors from class-validator
          toast.error(`Validation errors: ${error.response.data.message.join(', ')}`);
        } else {
          toast.error(`Error creating ticket: ${error.response.data.message}`);
        }
      } else if (error.response?.status === 404) {
        toast.error("Error: One of the selected references (user, customer, or site) was not found. Please check your selections.");
      } else if (error.response?.status === 500) {
        toast.error("Server error: Please check the console for details and try again.");
      } else {
        toast.error("Error creating ticket. Please try again.");
      }
    }
  };

  const getCustomerName = (ticket: Ticket) => {
    if (ticket.categoryName === "PreSales" || ticket.categoryName === "Others") {
      return ticket.manCustm || "N/A";
    } else {
      const foundCustomer = customers.find((c) => c.id === ticket.customerId);
      return ticket.customer?.customerName || foundCustomer?.customerName || "N/A";
    }
  };

  const getSiteName = (ticket: Ticket) => {
    if (ticket.categoryName === "PreSales" || ticket.categoryName === "Others") {
      return ticket.manSite || "N/A";
    } else {
      const foundSite = allSites.find((s) => s.id === ticket.siteId);
      return ticket.site?.siteName || foundSite?.siteName || "N/A";
    }
  };

  const isAdmin = () => {
    return userType === 'SUPERADMIN';
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !userId) return;
    
    try {
      await axios.post("http://http://192.168.29.167:8000/message", {
        content: newMessage,
        senderId: userId,
        ticketId: selectedTicket.id,
      });
      setNewMessage("");
      
      // Immediately refresh messages and ticket details after sending
      await fetchTicketDetails(selectedTicket.id);
      // Also refresh ticket list to update any status changes
      await fetchTickets();
      
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    // Strict status transition rules
    const currentTicket = tickets.find(t => t.id === ticketId);
    if (!currentTicket) {
      toast.error("Ticket not found.");
      return;
    }

    // Only admins can change status
    if (!isAdmin()) {
      toast.error("Only admins can change ticket status.");
      return;
    }

    // Validate status transitions
    const currentStatus = currentTicket.status;
    const validTransitions: Record<string, string[]> = {
      'OPEN': ['IN_PROGRESS'],
      'IN_PROGRESS': ['RESOLVED'],
      'RESOLVED': ['CLOSED'],
      'REOPENED': ['IN_PROGRESS'],
      'CLOSED': ['REOPENED'] // Admins can reopen closed tickets
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      toast.error(`Cannot change status from ${currentStatus} to ${newStatus}`);
      return;
    }

    try {
      await axios.patch(`http://http://192.168.29.167:8000/tickets/${ticketId}`, {
        status: newStatus,
      });
      
      // Refresh ticket list after status change
      fetchTickets();
      
      // If the chat modal is open and this is the selected ticket, refresh it too
      if (selectedTicket && selectedTicket.id === ticketId) {
        await fetchTicketDetails(ticketId);
      }
      
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update ticket status. Please try again.");
      }
    }
  };

  const handleReopenTicket = async (ticketId: number) => {
    const currentTicket = tickets.find(t => t.id === ticketId);
    if (!currentTicket) {
      toast.error("Ticket not found.");
      return;
    }

    // Only ticket creator can reopen CLOSED tickets
    if (currentTicket.status !== "CLOSED") {
      toast.error("Only closed tickets can be reopened.");
      return;
    }

    if (Number(currentTicket.createdById) !== Number(userId)) {
      toast.error("Only the ticket creator can reopen their tickets.");
      return;
    }

    try {
      await axios.patch(`http://http://192.168.29.167:8000/tickets/${ticketId}`, {
        status: "REOPENED",
      });
      
      // Refresh ticket list after reopening
      fetchTickets();
      
      // If the chat modal is open and this is the selected ticket, refresh it too
      if (selectedTicket && selectedTicket.id === ticketId) {
        await fetchTicketDetails(ticketId);
      }
      
      toast.success("Ticket reopened successfully!");
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to reopen ticket. Please try again.");
      }
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!isAdmin()) {
      toast.error("Only admins can delete tickets.");
      return;
    }

    if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`http://http://192.168.29.167:8000/tickets/${ticketId}`, {
        data: { deletedBy: userId }
      });
      
      // Immediately refresh tickets list
      await fetchTickets();
      
      // If the chat modal is open and this is the selected ticket, close it
      if (selectedTicket && selectedTicket.id === ticketId) {
        setChatModalOpen(false);
        setSelectedTicket(null);
      }
      
      toast.success("Ticket deleted successfully!");
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete ticket. Please try again.");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300";
      case "RESOLVED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300";
      case "REOPENED":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300";
      default:
        return "bg-white text-gray-800 hover:bg-gray-50 border border-gray-300";
    }
  };

  const canChangeToInProgress = (ticket: Ticket) => {
    return isAdmin() && (ticket.status === "OPEN" || ticket.status === "REOPENED");
  };

  const canResolve = (ticket: Ticket) => {
    return isAdmin() && ticket.status === "IN_PROGRESS";
  };

  const canClose = (ticket: Ticket) => {
    return isAdmin() && ticket.status === "RESOLVED";
  };

  const canReopen = (ticket: Ticket) => {
    // Admins can reopen CLOSED tickets OR ticket creator can reopen CLOSED tickets
    return ticket.status === "CLOSED" && (isAdmin() || Number(ticket.createdById) === Number(userId));
  };

  const canDelete = (ticket: Ticket) => {
    // Only admins can delete CLOSED tickets
    return isAdmin() && ticket.status === "CLOSED";
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (userId) {
      fetchTickets();
      fetchCustomers();
      fetchAllSites();
      fetchCurrentUser();
    }
  }, [userId]);

  // Auto-refresh tickets and messages every 30 seconds for real-time updates
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchTickets();
      
      // If chat modal is open, refresh the current ticket and messages
      if (isChatModalOpen && selectedTicket) {
        fetchTicketDetails(selectedTicket.id);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId, isChatModalOpen, selectedTicket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatScrollRef.current && messages.length > 0) {
      const scrollElement = chatScrollRef.current.parentElement;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <AppSidebarLayout>
      <div className="space-y-6 p-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Support Tickets {userType === 'SUPERADMIN' ? '(Admin View)' : '(User View)'}
            </h1>
            <p className="text-muted-foreground">
              {userType === 'SUPERADMIN' 
                ? "Manage and track all customer support tickets" 
                : "View and manage your support tickets"
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
              />
            </div>
            
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchTickets();
                toast.success("Tickets refreshed!");
              }}
              className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            
            <Dialog open={isTicketModalOpen} onOpenChange={setTicketModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Create New Support Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={form.categoryName} onValueChange={(value) => {
                        // Reset form when category changes
                        setForm({
                          customerId: 0,
                          siteId: 0,
                          title: form.title, // Keep title
                          description: form.description, // Keep description
                          categoryName: value,
                          subCategoryName: "",
                          serviceCategoryName: [],
                          contactPerson: "",
                          mobileNo: "",
                          proposedDate: "",
                          priority: "",
                          manCustm: "",
                          manSite: "",
                        });
                        setSites([]); // Reset sites
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PreSales">PreSales</SelectItem>
                          <SelectItem value="On-Site Visit">On-Site Visit</SelectItem>
                          <SelectItem value="Remote Support">Remote Support</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subcategory Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select value={form.subCategoryName} onValueChange={(value) => setForm({ ...form, subCategoryName: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Consultancy">Consultancy</SelectItem>
                          <SelectItem value="Demo">Demo</SelectItem>
                          <SelectItem value="Delivery">Delivery</SelectItem>
                          <SelectItem value="Installation">Installation</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Handover">Handover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Customer & Site Selection for On-Site Visit and Remote Support */}
                    {(form.categoryName === "On-Site Visit" || form.categoryName === "Remote Support") && (
                      <>
                        <div className="space-y-2">
                          <Label>Customer</Label>
                          <SimpleCustomerSelect
                            selectedValue={form.customerId}
                            onSelect={(customerId: number) => {
                              const newForm = { ...form, customerId };
                              setForm(newForm);
                              const customerSites = allSites.filter(site => site.customerId === customerId);
                              setSites(customerSites);
                            }}
                            placeholder="Select customer..."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Site</Label>
                          <Select value={form.siteId.toString()} onValueChange={(value) => setForm({ ...form, siteId: parseInt(value) })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select site" />
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

                        {/* Contact Details for On-Site Visit and Remote Support */}
                        <div className="space-y-2">
                          <Label>Contact Person</Label>
                          <Input
                            placeholder="Enter contact person name"
                            value={form.contactPerson}
                            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Mobile Number</Label>
                          <Input
                            placeholder="Enter mobile number"
                            value={form.mobileNo}
                            onChange={(e) => setForm({ ...form, mobileNo: e.target.value })}
                          />
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="Urgent">Urgent</SelectItem>
                              <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Proposed Date */}
                        <div className="space-y-2">
                          <Label>Proposed Date</Label>
                          <Input
                            type="datetime-local"
                            value={form.proposedDate}
                            onChange={(e) => setForm({ ...form, proposedDate: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* Manual Customer & Site for PreSales */}
                    {form.categoryName === "PreSales" && (
                      <>
                        <div className="space-y-2">
                          <Label>Customer Name</Label>
                          <Input
                            placeholder="Enter customer name"
                            value={form.manCustm || ""}
                            onChange={(e) => setForm({ ...form, manCustm: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Site Address</Label>
                          <Input
                            placeholder="Enter site address"
                            value={form.manSite || ""}
                            onChange={(e) => setForm({ ...form, manSite: e.target.value })}
                          />
                        </div>

                        {/* Contact Details for PreSales */}
                        <div className="space-y-2">
                          <Label>Contact Person</Label>
                          <Input
                            placeholder="Enter contact person name"
                            value={form.contactPerson}
                            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Mobile Number</Label>
                          <Input
                            placeholder="Enter mobile number"
                            value={form.mobileNo}
                            onChange={(e) => setForm({ ...form, mobileNo: e.target.value })}
                          />
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="Urgent">Urgent</SelectItem>
                              <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Proposed Date */}
                        <div className="space-y-2">
                          <Label>Proposed Date</Label>
                          <Input
                            type="datetime-local"
                            value={form.proposedDate}
                            onChange={(e) => setForm({ ...form, proposedDate: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* Minimal form for Others category */}
                    {form.categoryName === "Others" && (
                      <>
                        {/* Priority */}
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="Urgent">Urgent</SelectItem>
                              <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Subject - Common for all categories */}
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      placeholder="Enter ticket subject"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Service Categories - Only for On-Site Visit and Remote Support */}
                  {(form.categoryName === "On-Site Visit" || form.categoryName === "Remote Support") && (
                    <div className="space-y-2">
                      <Label>Service Categories</Label>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              "Consultancy",
                              "Networking",
                              "WiFi",
                              "CCTV",
                              "PBX",
                              "ACC",
                              "Passive Infra",
                              "OpenWi",
                              "OpenWan",
                              "Software",
                            ].map((category) => (
                              <div key={category} className="flex items-center space-x-2">
                                <Checkbox
                                  id={category}
                                  checked={form.serviceCategoryName.includes(category)}
                                  onCheckedChange={(checked: boolean) => {
                                    if (checked) {
                                      setForm(prev => ({
                                        ...prev,
                                        serviceCategoryName: [...prev.serviceCategoryName, category]
                                      }));
                                    } else {
                                      setForm(prev => ({
                                        ...prev,
                                        serviceCategoryName: prev.serviceCategoryName.filter(item => item !== category)
                                      }));
                                    }
                                  }}
                                />
                                <Label htmlFor={category} className="text-sm">
                                  {category}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Description - Common for all categories */}
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Enter detailed description..."
                      value={form.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setTicketModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Create Ticket
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Tickets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Tag className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">Support Tickets</span>
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                    {filteredTickets.length} total
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-white/50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                        {(statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all") && (
                          <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
                            !
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
                      <div className="p-2 bg-white">
                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full mt-1 bg-white">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            <SelectItem value="REOPENED">Reopened</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-2 bg-white">
                        <Label className="text-sm font-medium text-gray-700">Priority</Label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger className="w-full mt-1 bg-white">
                            <SelectValue placeholder="All priorities" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-2 bg-white">
                        <Label className="text-sm font-medium text-gray-700">Category</Label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-full mt-1 bg-white">
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="PreSales">PreSales</SelectItem>
                            <SelectItem value="On-Site Visit">On-Site Visit</SelectItem>
                            <SelectItem value="Remote Support">Remote Support</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-2 border-t bg-white">
                        <Label className="text-sm font-medium text-gray-700">Sort by Date</Label>
                        <div className="flex gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSortField("createdAt");
                              setSortOrder("desc");
                            }}
                            className="flex-1 bg-white"
                          >
                            Newest First
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSortField("createdAt");
                              setSortOrder("asc");
                            }}
                            className="flex-1 bg-white"
                          >
                            Oldest First
                          </Button>
                        </div>
                      </div>
                      <div className="p-2 border-t bg-white">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStatusFilter("all");
                            setPriorityFilter("all");
                            setCategoryFilter("all");
                            setSortField(null);
                            setSortOrder("asc");
                          }}
                          className="w-full bg-white"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {filteredTickets.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {currentTickets.length} of {filteredTickets.length} shown
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50 border-b-2 border-slate-200">
                      {headers.map(({ label, key }) => (
                        <TableHead
                          key={key}
                          className={`text-center font-semibold py-4 px-6 ${
                            key !== "actions" ? "cursor-pointer hover:bg-muted/50" : ""
                          }`}
                          onClick={() => {
                            if (key === "actions") return;
                            if (sortField === key) {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortField(key);
                              setSortOrder("asc");
                            }
                            setCurrentPage(1);
                          }}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            <span>{label}</span>
                            {key !== "actions" && (
                              <div className="flex flex-col">
                                <span className={`text-xs leading-none ${
                                  sortField === key && sortOrder === "asc"
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}>
                                  ▲
                                </span>
                                <span className={`text-xs leading-none ${
                                  sortField === key && sortOrder === "desc"
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}>
                                  ▼
                                </span>
                              </div>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={headers.length} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-muted-foreground">Loading tickets...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : currentTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={headers.length} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                              <Tag className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-slate-800">No tickets found</h3>
                              <p className="text-sm text-muted-foreground">
                                {searchQuery ? "Try adjusting your search terms" : "Create your first support ticket to get started"}
                              </p>
                            </div>
                            {!searchQuery && (
                              <Button
                                onClick={() => setTicketModalOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Ticket
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-muted/50 h-20 border-b border-slate-100">
                        <TableCell className="text-center py-4 px-6">
                          <div className="flex items-center justify-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(ticket.createdAt), "hh:mm a")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4 px-6">
                          <div className="font-mono text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            {ticket.ticketId}
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4 px-6">
                          <Badge variant="secondary">
                            {ticket.categoryName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-4 px-6">
                          <Badge variant="outline">
                            {ticket.subCategoryName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-4 px-6">
                          <div className="flex items-center justify-center space-x-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {getCustomerName(ticket)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4 px-6">
                          <div className="flex items-center justify-center space-x-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {getSiteName(ticket)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4 px-6">
                          {ticket.proposedDate ? (
                            <div className="flex items-center justify-center space-x-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(new Date(ticket.proposedDate), "MMM dd, yyyy hh:mm a")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-4 px-6">
                          <Badge
                            variant={
                              ticket.priority === "Critical" || ticket.priority === "Urgent"
                                ? "destructive"
                                : ticket.priority === "HIGH"
                                ? "default"
                                : "secondary"
                            }
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-4 px-6">
                          <Badge
                            variant="outline"
                            className={getStatusColor(ticket.status)}
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-4 px-6">
                          <div className="flex items-center justify-center space-x-2">
                            {/* Chat Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                await fetchTicketDetails(ticket.id);
                                setChatModalOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                              title="View Chat"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            
                            {/* Status Management Dropdown */}
                            {(() => {
                              const canReopenTicket = canReopen(ticket);
                              const shouldShowDropdown = isAdmin() || canReopenTicket;
                              return shouldShowDropdown;
                            })() && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {/* Admin status transitions */}
                                  {isAdmin() && canChangeToInProgress(ticket) && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "IN_PROGRESS")}>
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Mark In Progress
                                    </DropdownMenuItem>
                                  )}
                                  {isAdmin() && canResolve(ticket) && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "RESOLVED")}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Resolved
                                    </DropdownMenuItem>
                                  )}
                                  {isAdmin() && canClose(ticket) && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "CLOSED")}>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Close Ticket
                                    </DropdownMenuItem>
                                  )}
                                  {isAdmin() && ticket.status === "CLOSED" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "REOPENED")}>
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Reopen Ticket
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {/* Reopen option for ticket creators (non-admin users) */}
                                  {!isAdmin() && canReopen(ticket) && (
                                    <DropdownMenuItem onClick={() => handleReopenTicket(ticket.id)}>
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Reopen Ticket
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            
                            {/* Delete Button for Admins */}
                            {canDelete(ticket) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTicket(ticket.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete Ticket"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {filteredTickets.length > 0 && (
                <div className="flex items-center justify-between p-4 border-t bg-gradient-to-r from-slate-50 to-white">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * ticketsPerPage + 1}</span> to{" "}
                    <span className="font-semibold text-slate-700">{Math.min(currentPage * ticketsPerPage, filteredTickets.length)}</span> of{" "}
                    <span className="font-semibold text-slate-700">{filteredTickets.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const pageNum = totalPages <= 5 ? i + 1 : 
                        currentPage <= 3 ? i + 1 :
                        currentPage >= totalPages - 2 ? totalPages - 4 + i :
                        currentPage - 2 + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                            : "hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Modal */}
        <Dialog open={isChatModalOpen} onOpenChange={setChatModalOpen}>
          <DialogContent className="sm:max-w-4xl bg-white max-h-[90vh] flex flex-col">
            <DialogHeader className="border-b pb-4 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
              <DialogTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-slate-800">Ticket Chat</span>
                <Badge variant="outline" className="ml-2 font-mono">
                  {selectedTicket?.ticketId}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            {/* Ticket Info */}
            <div className="border-b pb-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Ticket ID</Label>
                  <p className="font-medium">{selectedTicket?.ticketId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="font-medium">{selectedTicket?.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p className="font-medium">
                    {selectedTicket?.categoryName === "PreSales" || selectedTicket?.categoryName === "Others"
                      ? selectedTicket?.manCustm || "N/A"
                      : (selectedTicket?.customer?.customerName || customers.find((c) => c.id === selectedTicket?.customerId)?.customerName || "N/A")
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Site</Label>
                  <p className="font-medium">
                    {selectedTicket?.categoryName === "PreSales" || selectedTicket?.categoryName === "Others"
                      ? selectedTicket?.manSite || "N/A"
                      : (selectedTicket?.site?.siteName || allSites.find((s) => s.id === selectedTicket?.siteId)?.siteName || "N/A")
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge variant={
                    selectedTicket?.priority === "Critical" || selectedTicket?.priority === "Urgent"
                      ? "destructive"
                      : selectedTicket?.priority === "HIGH"
                      ? "default"
                      : "secondary"
                  }>
                    {selectedTicket?.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant="outline">{selectedTicket?.status}</Badge>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedTicket?.description}</p>
                </div>
              </div>
            </div>

            {/* Status Management Controls */}
            {selectedTicket && (
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium">Current Status:</Label>
                    <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                    {isRefreshing && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-xs">Updating...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Refresh Chat Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (selectedTicket) {
                          await fetchTicketDetails(selectedTicket.id);
                          toast.success("Chat refreshed!");
                        }
                      }}
                      className="flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-300"
                      title="Refresh chat and status"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Refresh</span>
                    </Button>
                    
                    {/* Admin Controls */}
                    {isAdmin() && (
                      <>
                        {canChangeToInProgress(selectedTicket) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(selectedTicket.id, "IN_PROGRESS")}
                            className="flex items-center space-x-1"
                            title="Mark this ticket as in progress"
                          >
                            <PlayCircle className="h-4 w-4" />
                            <span>Mark In Progress</span>
                          </Button>
                        )}
                        
                        {canResolve(selectedTicket) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(selectedTicket.id, "RESOLVED")}
                            className="flex items-center space-x-1"
                            title="Mark this ticket as resolved"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark Resolved</span>
                          </Button>
                        )}
                        
                        {canClose(selectedTicket) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(selectedTicket.id, "CLOSED")}
                            className="flex items-center space-x-1"
                            title="Close this ticket"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Close Ticket</span>
                          </Button>
                        )}
                        
                        {selectedTicket?.status === "CLOSED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(selectedTicket.id, "REOPENED")}
                            className="flex items-center space-x-1"
                            title="Reopen this ticket"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Reopen Ticket</span>
                          </Button>
                        )}
                        
                        {canDelete(selectedTicket) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTicket(selectedTicket.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                            title="Delete this ticket"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Ticket</span>
                          </Button>
                        )}
                      </>
                    )}
                    
                    {/* User Reopen Control - Only show if user is not admin */}
                    {!isAdmin() && canReopen(selectedTicket) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReopenTicket(selectedTicket.id)}
                        className="flex items-center space-x-1"
                        title="Reopen your closed ticket"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Reopen Ticket</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 min-h-0 max-h-96 overflow-y-auto bg-gradient-to-b from-slate-50 to-white border rounded-lg p-4 space-y-4">
              <div ref={chatScrollRef} className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
                    >
                      <Card className={`max-w-md shadow-sm border-0 ${
                        msg.senderId === userId
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-slate-800"
                      }`}>
                        <CardContent className="p-3">
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-opacity-20">
                            <span className={`text-xs ${
                              msg.senderId === userId ? "text-blue-100" : "text-slate-500"
                            }`}>
                              {format(new Date(msg.createdAt), "MMM dd, hh:mm a")}
                            </span>
                            {msg.status && (
                              <Badge variant="secondary" className="text-xs h-5">
                                {msg.status}
                              </Badge>
                            )}
                          </div>
                          <div className={`text-xs mt-1 ${
                            msg.senderId === userId ? "text-blue-100" : "text-slate-500"
                          }`}>
                            {msg.sender?.username || (msg.senderId === userId ? "You" : `User ${msg.senderId}`)}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {messages.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t pt-4 bg-gradient-to-r from-slate-50 to-white p-4">
              <div className="flex space-x-2">
                <Input
                  className="flex-1 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </AppSidebarLayout>
  );
}
