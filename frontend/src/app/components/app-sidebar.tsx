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
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [addressBookOpen, setAddressBookOpen] = useState(false);

  // Auto-open sections based on current path
  useEffect(() => {
    if (pathname?.startsWith('/vendor') || pathname?.startsWith('/customer') || pathname?.startsWith('/site')) {
      setAddressBookOpen(true);
    }
    if (pathname?.startsWith('/service')) {
      setServiceOpen(true);
    }
    if (pathname?.startsWith('/category') || pathname?.startsWith('/subCategory') || 
        pathname?.startsWith('/product') || pathname?.startsWith('/inventory') || 
        pathname?.startsWith('/purchaseInvoice') || pathname?.startsWith('/material') || 
        pathname?.startsWith('/vendorPayment')) {
      setInventoryOpen(true);
    }
  }, [pathname]);

  // Auto-close dropdowns when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setAddressBookOpen(false);
      setServiceOpen(false);
      setInventoryOpen(false);
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
      icon: Home,
      gradient: "from-blue-500 to-purple-600" 
    },
    { 
      title: "Departments", 
      url: "/department", 
      icon: Building2,
      gradient: "from-green-500 to-teal-600" 
    },
    ...(userType === "SUPERADMIN"
      ? [{ 
          title: "User Management", 
          url: "/users", 
          icon: Users,
          gradient: "from-orange-500 to-red-600" 
        }]
      : []),
  ];

  const dropdownSections = [
    {
      label: "Address Book",
      icon: FaRegAddressBook,
      open: addressBookOpen,
      setOpen: setAddressBookOpen,
      gradient: "from-purple-500 to-pink-600",
      items: [
        { label: "Vendors", url: "/vendor", icon: ShoppingBag },
        { label: "Customers", url: "/customer", icon: Users },
        { label: "Customer Sites", url: "/site", icon: Building2 },
      ],
    },
    {
      label: "Services",
      icon: LucideSettings,
      open: serviceOpen,
      setOpen: setServiceOpen,
      gradient: "from-cyan-500 to-blue-600",
      items: [
        { label: "Service Category", url: "/serviceCategory", icon: Settings },
        { label: "Service SubCategory", url: "/serviceSubCategory", icon: Settings },
        { label: "Service SKU", url: "/service", icon: Wrench },
        { label: "Service Contracts", url: "/servicecontract", icon: Package },
      ],
    },
    {
      label: "Inventory",
      icon: BiCategory,
      open: inventoryOpen,
      setOpen: setInventoryOpen,
      gradient: "from-indigo-500 to-purple-600",
      items: [
        { label: "Product Category", url: "/category", icon: Package },
        { label: "Product SubCategory", url: "/subCategory", icon: Package },
        { label: "Product SKU", url: "/product", icon: Package },
        { label: "Inventory", url: "/inventory", icon: Package },
        { label: "Purchase Invoice", url: "/purchaseInvoice", icon: Package },
        { label: "Material Outward", url: "/material", icon: Package },
        { label: "Vendors Payment", url: "/vendorPayment", icon: Package },
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
      className="border-r border-slate-200/60 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:border-slate-700/60 backdrop-blur-xl group-data-[collapsible=icon]:w-[4rem]"
    >
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mb-2"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6"
          >
            E
          </motion.div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              ENPL ERP
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inventory Management
            </p>
          </div>
        </motion.div>

        {/* User Info Display */}
        {userDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group-data-[collapsible=icon]:hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-3 border border-blue-100 dark:border-slate-600"
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
              >
                {userDetails.name ? userDetails.name.charAt(0).toUpperCase() : userDetails.username.charAt(0).toUpperCase()}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {userDetails.name || userDetails.username}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {userDetails.userType}
                  </span>
                  {userDetails.departmentName && (
                    <>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {userDetails.departmentName}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-2 h-2 bg-green-500 rounded-full shadow-sm"
                title="Online"
              />
            </div>
          </motion.div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-2 group-data-[collapsible=icon]:px-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 group-data-[collapsible=icon]:hidden">
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
                        className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
                          active ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <motion.div
                          onClick={() => router.push(item.url)}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 min-h-[48px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3 cursor-pointer ${
                            active 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' 
                              : 'hover:bg-gradient-to-r hover:from-white hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md p-1 shadow-sm ${
                              active ? 'shadow-md scale-110' : ''
                            } ${
                              isCollapsed 
                                ? 'w-8 h-8 p-0 bg-transparent shadow-none' 
                                : `bg-gradient-to-r ${item.gradient}`
                            }`}
                          >
                            <item.icon className={`w-full h-full ${
                              isCollapsed 
                                ? 'text-slate-700 dark:text-slate-300' 
                                : 'text-white'
                            }`} />
                          </div>
                          <span className={`font-medium transition-colors group-data-[collapsible=icon]:hidden ${
                            active 
                              ? 'text-blue-700 font-semibold' 
                              : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                          } leading-tight`}>
                            {item.title}
                          </span>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            className="ml-auto group-data-[collapsible=icon]:hidden"
                          >
                            <ChevronRight className={`w-4 h-4 ${active ? 'text-blue-500' : 'text-slate-400'}`} />
                          </motion.div>
                          {active && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full"
                            />
                          )}
                        </motion.div>
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
                      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
                        sectionHasActiveItem ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 w-full min-h-[48px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3 ${
                          sectionHasActiveItem 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' 
                            : 'hover:bg-gradient-to-r hover:from-white hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700'
                        }`}
                        onContextMenu={(e) => handleDropdownRightClick(e, section)}
                      >
                        <div
                          className={`w-5 h-5 rounded-md p-1 shadow-sm ${
                            sectionHasActiveItem ? 'shadow-md scale-110' : ''
                          } ${
                            isCollapsed 
                              ? 'w-8 h-8 p-0 bg-transparent shadow-none' 
                              : `bg-gradient-to-r ${section.gradient}`
                          }`}
                        >
                          <section.icon className={`w-full h-full ${
                            isCollapsed 
                              ? 'text-slate-700 dark:text-slate-300' 
                              : 'text-white'
                          }`} />
                        </div>
                        <span className={`font-medium transition-colors group-data-[collapsible=icon]:hidden ${
                          sectionHasActiveItem 
                            ? 'text-blue-700 font-semibold' 
                            : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                        } leading-tight`}>
                          {section.label}
                        </span>
                        <motion.div
                          animate={{ rotate: section.open ? 90 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-auto group-data-[collapsible=icon]:hidden"
                        >
                          <ChevronRight className={`w-4 h-4 ${sectionHasActiveItem ? 'text-blue-500' : 'text-slate-400'}`} />
                        </motion.div>
                        {sectionHasActiveItem && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full group-data-[collapsible=icon]:right-1"
                          />
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {section.open && !isCollapsed && (
                        <SidebarMenuSub>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {section.items.map((item, itemIndex) => {
                              const isItemActive = isActive(item.url);
                              return (
                              <SidebarMenuSubItem key={itemIndex}>
                                <motion.div
                                  onClick={() => router.push(item.url)}
                                  whileTap={{ scale: 0.98 }}
                                  className={`flex items-center gap-3 p-3 rounded-md transition-all duration-300 group min-h-[44px] cursor-pointer ${
                                    isItemActive 
                                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-l-2 border-blue-500 shadow-sm' 
                                      : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600'
                                  }`}
                                >
                                    <div
                                      className={`w-4 h-4 transition-colors ${
                                        isItemActive 
                                          ? 'text-blue-600' 
                                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                                      }`}
                                    >
                                      <item.icon className="w-full h-full" />
                                    </div>
                                    <span className={`text-sm transition-colors group-data-[collapsible=icon]:hidden ${
                                      isItemActive 
                                        ? 'text-blue-700 font-semibold' 
                                        : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                                    } leading-tight`}>
                                      {item.label}
                                    </span>
                                    {isItemActive && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full group-data-[collapsible=icon]:hidden"
                                      />
                                    )}
                                  </motion.div>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </motion.div>
                        </SidebarMenuSub>
                      )}
                    </AnimatePresence>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            );
          })}

          <Separator className="my-4 bg-slate-200 dark:bg-slate-700" />

          {/* Support Ticket */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div
                    onClick={() => router.push('/ticket')}
                    className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
                      isActive('/ticket') ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <motion.div
                      onClick={() => router.push('/ticket')}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 min-h-[48px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3 cursor-pointer ${
                        isActive('/ticket') 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' 
                          : 'hover:bg-gradient-to-r hover:from-white hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md p-1 shadow-sm ${
                          isActive('/ticket') ? 'shadow-md scale-110' : ''
                        } ${
                          isCollapsed 
                            ? 'w-8 h-8 p-0 bg-transparent shadow-none' 
                            : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                        }`}
                      >
                        <Ticket className={`w-full h-full ${
                          isCollapsed 
                            ? 'text-slate-700 dark:text-slate-300' 
                            : 'text-white'
                        }`} />
                      </div>
                      <span className={`font-medium transition-colors group-data-[collapsible=icon]:hidden ${
                        isActive('/ticket') 
                          ? 'text-blue-700 font-semibold' 
                          : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                      } leading-tight`}>
                        Support Ticket
                      </span>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        className="ml-auto group-data-[collapsible=icon]:hidden"
                      >
                        <ChevronRight className={`w-4 h-4 ${isActive('/ticket') ? 'text-blue-500' : 'text-slate-400'}`} />
                      </motion.div>
                      {isActive('/ticket') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full group-data-[collapsible=icon]:right-1"
                        />
                      )}
                    </motion.div>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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
            className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" />
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Inventory Management
              </h1>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </motion.div>
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
