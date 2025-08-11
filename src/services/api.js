// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// API Service Class
class ApiService {
  // Authentication
  static async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }

  static async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  }

  static async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async updateProfile(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/me/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }

  // Products
  static async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/products?${queryString}` : `${API_BASE_URL}/products`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  }

  static async getProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  }

  static async createProduct(productData) {
    const response = await fetch(`${API_BASE_URL}/products/new`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  }

  static async updateProduct(id, productData) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  }

  static async deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async addReview(reviewData) {
    const response = await fetch(`${API_BASE_URL}/products/review`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });
    return handleResponse(response);
  }

  static async getProductReviews(productId) {
    const response = await fetch(`${API_BASE_URL}/products/reviews/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  }

  // Orders
  static async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders/new`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  }

  static async getOrder(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async getUserOrders() {
    const response = await fetch(`${API_BASE_URL}/orders/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async cancelOrder(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async requestReturn(id, returnReason) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/return`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ returnReason })
    });
    return handleResponse(response);
  }

  // Admin Orders
  static async getAllOrders() {
    const response = await fetch(`${API_BASE_URL}/orders/admin/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async updateOrderStatus(id, orderData) {
    const response = await fetch(`${API_BASE_URL}/orders/admin/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  }

  // Users (Admin)
  static async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users/admin/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  // Health Check
  static async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  }
}

export default ApiService; 