// API Configuration
export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: 'http://192.168.0.102:8000',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
    },
    USERS: '/users',
    DEPARTMENTS: '/departments',
    CUSTOMERS: '/customers',
    VENDORS: '/vendors',
    SITES: '/sites',
    PRODUCTS: '/products',
    CATEGORY: '/category',
    SUBCATEGORY: '/subcategory',
    SERVICE: '/service',
    SERVICE_CATEGORY: '/servicecategory',
    SERVICE_SUBCATEGORY: '/servicesubcategory',
    INVENTORY: '/inventory',
    MATERIAL_DELIVERY: '/material-delivery',
    VENDOR_PAYMENT: '/vendor-payment',
    TICKETS: '/tickets',
    MESSAGES: '/message',
    TASKS: '/tasks',
    SERVICE_CONTRACTS: '/servicecontracts',
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to build full URL with query params
export const buildApiUrlWithParams = (endpoint: string, params: Record<string, string | number>): string => {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
  return url.toString();
};
