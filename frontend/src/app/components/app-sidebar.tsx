"use client";
import React, { useEffect, useState } from "react";
import {
  BiCategory,
  BiStoreAlt,
  BiTask,
  BiSolidDashboard,
} from "react-icons/bi";
import {
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LogOut,
  LucideSettings,
  Home,
  Building2,
  Users,
  Package,
  Wrench,
  ShoppingBag,
  Settings,
  Ticket,
  User,
  ChevronRight,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  ClipboardList,
  FileText,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import { FaRegAddressBook, FaTicketAlt, FaUser } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const { userType, userDetails } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [setupOpen, setSetupOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [vendorsManagementOpen, setVendorsManagementOpen] = useState(false);
  const [inventoryManagementOpen, setInventoryManagementOpen] = useState(false);
  const [serviceContractsOpen, setServiceContractsOpen] = useState(false);
  const [taskManagementOpen, setTaskManagementOpen] = useState(false);

  // Auto-open sections based on current path
  useEffect(() => {
    // Close all sections first
    setSetupOpen(false);
    setAddressBookOpen(false);
    setServiceOpen(false);
    setInventoryOpen(false);
    setVendorsManagementOpen(false);
    setInventoryManagementOpen(false);
    setServiceContractsOpen(false);
    setTaskManagementOpen(false);

    // Auto-open relevant section based on current path
    if (pathname?.includes('/service-provider') || pathname?.includes('/company') || pathname?.includes('/branches') || pathname?.includes('/department')) {
      setSetupOpen(true);
    }
    else if (pathname?.startsWith('/vendor') || pathname?.startsWith('/customer') || pathname?.startsWith('/site')) {
      setAddressBookOpen(true);
    }
    else if (pathname?.startsWith('/serviceCategory') || pathname?.startsWith('/serviceSubCategory') || pathname?.startsWith('/service')) {
      setServiceOpen(true);
    }
    else if (pathname?.startsWith('/category') || pathname?.startsWith('/subCategory') || pathname?.startsWith('/product')) {
      setInventoryOpen(true);
    }
    else if (pathname?.startsWith('/purchaseInvoice') || pathname?.startsWith('/vendorPayment')) {
      setVendorsManagementOpen(true);
    }
    else if (pathname?.startsWith('/material') || (pathname?.startsWith('/inventory') && !pathname?.includes('/reports'))) {
      setInventoryManagementOpen(true);
    }
    else if (pathname?.startsWith('/servicecontract') || pathname?.includes('/service-contracts')) {
      setServiceContractsOpen(true);
    }
    else if (pathname?.includes('/task') || pathname?.includes('/ticket')) {
      setTaskManagementOpen(true);
    }
  }, [pathname]);

  // Auto-close dropdowns when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setAddressBookOpen(false);
      setServiceOpen(false);
      setInventoryOpen(false);
      setSetupOpen(false);
      setVendorsManagementOpen(false);
      setInventoryManagementOpen(false);
      setServiceContractsOpen(false);
      setTaskManagementOpen(false);
    }
  }, [isCollapsed]);

  const isActive = (path: string) => pathname === path;
  const isSubSectionActive = (paths: string[]) => paths.some(path => pathname === path);
  
  // Check if any subsection of a dropdown is active
  const isDropdownSectionActive = (items: Array<{url: string}>) => {
    return items.some(item => pathname === item.url);
  };

  const menuItems = [
    { 
      title: "Dashboard", 
      url: "/dashboard", 
      icon: Home
    },
  ];

  const dropdownSections = [
    {
      label: "Setup",
      icon: Settings,
      open: setupOpen,
      setOpen: setSetupOpen,
      items: [
        { label: "Service Providers", url: "/service-provider", icon: Settings },
        { label: "Company", url: "/company", icon: Building2 },
        { label: "Branches", url: "/branches", icon: Building2 },
        { label: "Departments", url: "/department", icon: Building2 },
      ],
    },
    {
      label: "Address Book",
      icon: FaRegAddressBook,
      open: addressBookOpen,
      setOpen: setAddressBookOpen,
      items: [
        { label: "Vendors", url: "/vendor", icon: ShoppingBag },
        { label: "Customers", url: "/customer", icon: Users },
        { label: "Customer Sites", url: "/site", icon: Building2 },
      ],
    },
    {
      label: "Services Management",
      icon: LucideSettings,
      open: serviceOpen,
      setOpen: setServiceOpen,
      items: [
        { label: "Service Category", url: "/serviceCategory", icon: Settings },
        { label: "Service Sub Category", url: "/serviceSubCategory", icon: Settings },
        { label: "Service SKU", url: "/service", icon: Wrench },
      ],
    },
    {
      label: "Product Management",
      icon: BiCategory,
      open: inventoryOpen,
      setOpen: setInventoryOpen,
      items: [
        { label: "Product Category", url: "/category", icon: Package },
        { label: "Product Sub Category", url: "/subCategory", icon: Package },
        { label: "Product SKU", url: "/product", icon: Package },
      ],
    },
    {
      label: "Purchase Management",
      icon: ShoppingBag,
      open: vendorsManagementOpen,
      setOpen: setVendorsManagementOpen,
      items: [
        { label: "Purchase Invoices", url: "/purchaseInvoice", icon: Package },
        { label: "Vendors Payments", url: "/vendorPayment", icon: Package },
      ],
    },
    {
      label: "Inventory Management",
      icon: BiCategory,
      open: inventoryManagementOpen,
      setOpen: setInventoryManagementOpen,
      items: [
        { label: "Inventory", url: "/inventory", icon: Package },
        { label: "Material Outward", url: "/material", icon: Package },
      ],
    },
    {
      label: "Service Contracts",
      icon: Package,
      open: serviceContractsOpen,
      setOpen: setServiceContractsOpen,
      items: [
        { label: "Service Contracts List", url: "/servicecontract", icon: Package },
        { label: "Service Contracts Schedules", url: "/service-contracts-schedules", icon: Calendar },
      ],
    },
    {
      label: "Task Management",
      icon: BiTask,
      open: taskManagementOpen,
      setOpen: setTaskManagementOpen,
      items: [
        { label: "Task", url: "/task", icon: BiTask },
        { label: "Support Ticket", url: "/ticket", icon: FaTicketAlt },
      ],
    },
  ];

  const handleLogout = () => router.push("/");

  // Handle dropdown clicks in collapsed mode
  const handleDropdownClick = (section: any) => {
    if (isCollapsed) {
      // In collapsed mode, navigate to the first item of the section
      const firstItem = section.items[0];
      if (firstItem) {
        router.push(firstItem.url);
      }
    } else {
      // In expanded mode, toggle the dropdown
      section.setOpen(!section.open);
    }
  };

  // Handle right-click on dropdown sections in collapsed mode
  const handleDropdownRightClick = (e: React.MouseEvent, section: any) => {
    if (isCollapsed) {
      e.preventDefault();
      // Create a context menu with all options
      const contextMenu = document.createElement('div');
      contextMenu.className = 'fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 min-w-[200px]';
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
      
      section.items.forEach((item: any) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm';
        menuItem.textContent = item.label;
        menuItem.onclick = () => {
          router.push(item.url);
          document.body.removeChild(contextMenu);
        };
        contextMenu.appendChild(menuItem);
      });
      
      document.body.appendChild(contextMenu);
      
      // Remove context menu when clicking elsewhere
      const removeContextMenu = () => {
        if (document.body.contains(contextMenu)) {
          document.body.removeChild(contextMenu);
        }
        document.removeEventListener('click', removeContextMenu);
      };
      
      setTimeout(() => {
        document.addEventListener('click', removeContextMenu);
      }, 100);
    }
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 group-data-[collapsible=icon]:w-[4rem]"
    >
      <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
        <div
          className="flex items-center gap-3 mb-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mb-1"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6 overflow-hidden">
            <img 
              src="/Enpl-logo.jpeg" 
              alt="ENPL Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              ENPL ERP
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inventory Management
            </p>
          </div>
        </div>

      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-2 group-data-[collapsible=icon]:px-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 group-data-[collapsible=icon]:hidden">
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item, index) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={index}>
                      <div
                        onClick={() => router.push(item.url)}
                        className={`group cursor-pointer ${active ? 'bg-gray-100 border-l-2 border-purple-500' : ''}`}
                      >
                        <div
                          onClick={() => router.push(item.url)}
                          className={`flex items-center gap-3 p-4 rounded-lg min-h-[48px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3 ${
                            active 
                              ? 'text-slate-900' 
                              : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div
                            className={`${isCollapsed ? 'w-8 h-8' : 'w-5 h-5'} rounded-md flex items-center justify-center`}
                          >
                            <item.icon className={`w-full h-full ${
                              active ? 'text-purple-600' : 'text-slate-600 dark:text-slate-300'
                            }`} />
                          </div>
                          <span className={`font-medium group-data-[collapsible=icon]:hidden ${
                            active 
                              ? 'text-slate-900 font-semibold' 
                              : 'text-slate-700 dark:text-slate-300'
                          } leading-tight`}>
                            {item.title}
                          </span>
                          <div className="ml-auto group-data-[collapsible=icon]:hidden">
                            <ChevronRight className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                          </div>
                        </div>
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-4 bg-slate-200 dark:bg-slate-700 group-data-[collapsible=icon]:hidden" />

          {/* Dropdown Sections */}
          {dropdownSections.map((section, sectionIndex) => {
            const sectionHasActiveItem = isDropdownSectionActive(section.items);
            return (
            <SidebarGroup key={sectionIndex}>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <div
                      onClick={() => handleDropdownClick(section)}
                      className={`group cursor-pointer ${sectionHasActiveItem ? 'bg-gray-100 border-l-2 border-purple-500' : ''}`}
                      onContextMenu={(e) => handleDropdownRightClick(e, section)}
                    >
                      <div
                        className={`flex items-center gap-3 p-4 rounded-lg w-full min-h-[48px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3 ${
                          sectionHasActiveItem 
                            ? 'text-slate-900' 
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`${isCollapsed ? 'w-8 h-8' : 'w-5 h-5'} rounded-md flex items-center justify-center`}>
                          <section.icon className={`w-full h-full ${sectionHasActiveItem ? 'text-purple-600' : 'text-slate-600 dark:text-slate-300'}`} />
                        </div>
                        <span className={`font-medium group-data-[collapsible=icon]:hidden ${
                          sectionHasActiveItem 
                            ? 'text-slate-900 font-semibold' 
                            : 'text-slate-700 dark:text-slate-300'
                        } leading-tight`}>
                          {section.label}
                        </span>
                        <div className="ml-auto group-data-[collapsible=icon]:hidden">
                          <ChevronDown className={`w-4 h-4 ${section.open ? 'rotate-180 text-purple-600' : 'text-slate-400'} transition-transform`} />
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {section.open && !isCollapsed && (
                        <SidebarMenuSub>
                            {section.items.map((item, itemIndex) => {
                              const isItemActive = isActive(item.url);
                              return (
                              <SidebarMenuSubItem key={itemIndex}>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent event bubbling to parent
                                    router.push(item.url);
                                  }}
                                  className={`flex items-center gap-3 p-3 rounded-md group min-h-[44px] cursor-pointer ${
                                    isItemActive 
                                      ? 'bg-gray-100 border-l-2 border-purple-500' 
                                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                                  }`}
                                >
                                    <div
                                      className={`w-4 h-4 transition-colors ${
                                        isItemActive 
                                          ? 'text-purple-600' 
                                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                                      }`}
                                    >
                                      <item.icon className="w-full h-full" />
                                    </div>
                                    <span className={`text-sm transition-colors group-data-[collapsible=icon]:hidden ${
                                      isItemActive 
                                        ? 'text-slate-900 font-semibold' 
                                        : 'text-slate-600 dark:text-slate-400'
                                    } leading-tight`}>
                                      {item.label}
                                    </span>
                                </div>
                                </SidebarMenuSubItem>
                              );
                            })}
                        </SidebarMenuSub>
                      )}
                    </AnimatePresence>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            );
          })}

          {/* User Management */}
          {userType === "SUPERADMIN" && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <div
                      onClick={() => router.push('/users')}
                      className={`group cursor-pointer ${
                        isActive('/users') ? 'bg-gray-100 border-l-2 border-purple-500' : ''
                      }`}
                    >
                      <div
                        onClick={() => router.push('/users')}
                        className={`flex items-center gap-3 p-4 rounded-lg min-h-[48px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3 cursor-pointer ${
                          isActive('/users') 
                            ? 'text-slate-900' 
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`${isCollapsed ? 'w-8 h-8' : 'w-5 h-5'} rounded-md flex items-center justify-center`}>
                          <Users className={`w-full h-full ${
                            isActive('/users') ? 'text-purple-600' : 'text-slate-600 dark:text-slate-300'
                          }`} />
                        </div>
                        <span className={`font-medium group-data-[collapsible=icon]:hidden ${
                          isActive('/users') 
                            ? 'text-slate-900 font-semibold' 
                            : 'text-slate-700 dark:text-slate-300'
                        } leading-tight`}>
                          User Management
                        </span>
                        <div className="ml-auto group-data-[collapsible=icon]:hidden">
                          <ChevronRight className={`w-4 h-4 ${isActive('/users') ? 'text-purple-600' : 'text-slate-400'}`} />
                        </div>
                      </div>
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <Separator className="my-4 bg-slate-200 dark:bg-slate-700" />



        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="group-data-[collapsible=icon]:hidden"
        >
  
        </motion.div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

// Enhanced Layout Wrapper for existing pages
export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userDetails } = useAuth();
  
  const handleLogout = () => router.push("/");

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900">
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between p-4 bg-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" />
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Inventory Management
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* User Profile Section */}
              {userDetails && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
                  <div
                    className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md text-xs"
                  >
                    {userDetails.name ? userDetails.name.charAt(0).toUpperCase() : userDetails.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                        {userDetails.name || userDetails.username}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                        {userDetails.userType}
                      </p>
                    </div>
                    <div
                      className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1"
                      title="Online"
                    />
                  </div>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors px-3 py-2"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </motion.header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 h-full w-full"
            >
              <div className="w-full max-w-none">
                {children}
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
