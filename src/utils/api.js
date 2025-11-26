
const IP_NETWORK_1 = 'http://10.129.28.192:3000';
const IP_NETWORK_2 = 'http://192.168.29.46:3000';

const USE_NETWORK_1 = false;

const API_CONFIG = {
  BASE_URL: __DEV__
    ? (USE_NETWORK_1 ? IP_NETWORK_1 : IP_NETWORK_2)
    : 'http://localhost:3000',
  ENDPOINTS: {
    CATEGORIES: '/api/product-categories',
    CATEGORY_BY_ID: (id) => `/api/product-categories/${id}`,

    PRODUCTS: '/api/products',
    PRODUCT_BY_ID: (id) => `/api/products/${id}`,

    VARIANTS: '/api/variants',
    VARIANT_BY_ID: (id) => `/api/variants/${id}`,
    VARIANT_WITH_DETAILS: '/api/variants/with-details',
    PRODUCT_VARIANTS: (product_id) => `/api/variants/product/${product_id}`,

    INVENTORY: '/api/inventory',
    INVENTORY_BY_VARIANT: (variant_id) => `/api/inventory/variant/${variant_id}`,
    INVENTORY_LOW_STOCK: '/api/inventory/low-stock',
    INVENTORY_ADD: '/api/inventory/add',
    INVENTORY_REMOVE: '/api/inventory/remove',
    INVENTORY_RESERVE: '/api/inventory/reserve',
    INVENTORY_RELEASE: '/api/inventory/release',
    INVENTORY_COMMIT: '/api/inventory/commit',
    INVENTORY_ADJUST: '/api/inventory/adjust',

    ORDERS: '/api/orders',
    ORDER_BY_ID: (id) => `/api/orders/${id}`,
    ORDER_CANCEL: (id) => `/api/orders/${id}/cancel`,

    CUSTOMERS: '/api/customers',
    CUSTOMER_BY_ID: (id) => `/api/customers/${id}`,
    CUSTOMER_SEARCH: '/api/customers/search',

    LOGIN: '/api/auth/login',
  },
};


const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('🌐 API Request:', options.method || 'GET', url);

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    console.log('✅ API Response:', response.status, url);

    // Handle 204 No Content (for DELETE requests)
    if (response.status === 204) {
      return { success: true };
    }

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};


export const getCategories = async () => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.CATEGORIES, {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};


export const getCategoryById = async (id) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};


export const createCategory = async (categoryData) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.CATEGORIES, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};


export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};


export const deleteCategory = async (id) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), {
      method: 'DELETE',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const getProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.PRODUCTS}?${queryString}` : API_CONFIG.ENDPOINTS.PRODUCTS;

    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};


export const getProductById = async (id) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id), {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};


export const createProduct = async (productData) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};


export const updateProduct = async (id, productData) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};


export const deleteProduct = async (id) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id), {
      method: 'DELETE',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};
export const createVariantWithDetails = async (data) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.VARIANT_WITH_DETAILS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error creating variant with details:', error);
    throw error;
  }
};

export const getProductVariants = async (productId) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.PRODUCT_VARIANTS(productId), {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching product variants:', error);
    throw error;
  }
};

export const getInventoryByVariant = async (variantId) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.INVENTORY_BY_VARIANT(variantId), {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

export const getLowStockItems = async () => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.INVENTORY_LOW_STOCK, {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

export const adjustInventory = async (data) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.INVENTORY_ADJUST, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.ORDERS}?${queryString}` : API_CONFIG.ENDPOINTS.ORDERS;

    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.ORDER_BY_ID(id), {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const cancelOrder = async (id) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.ORDER_CANCEL(id), {
      method: 'POST',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.CUSTOMERS, {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const getCustomers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.CUSTOMERS}?${queryString}` : API_CONFIG.ENDPOINTS.CUSTOMERS;

    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const searchCustomers = async (search) => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.CUSTOMER_SEARCH}?search=${encodeURIComponent(search)}`;
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.CUSTOMER_BY_ID(id), {
      method: 'GET',
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

export { API_CONFIG };
