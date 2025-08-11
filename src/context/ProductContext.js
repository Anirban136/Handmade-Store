import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 8
  });

  // Fetch products with filters
  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = { ...filters, ...params };
      const response = await ApiService.getProducts(queryParams);
      
      setProducts(response.products);
      setPagination({
        currentPage: parseInt(queryParams.page) || 1,
        totalPages: Math.ceil(response.productsCount / response.resPerPage),
        totalProducts: response.productsCount,
        productsPerPage: response.resPerPage
      });
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get single product
  const getProduct = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getProduct(id);
      return response.product;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const searchProducts = async (keyword) => {
    await fetchProducts({ keyword, page: 1 });
  };

  // Filter products by category
  const filterByCategory = async (category) => {
    await fetchProducts({ category, page: 1 });
  };

  // Filter products by price range
  const filterByPrice = async (minPrice, maxPrice) => {
    await fetchProducts({ minPrice, maxPrice, page: 1 });
  };

  // Filter products by rating
  const filterByRating = async (rating) => {
    await fetchProducts({ rating, page: 1 });
  };

  // Clear all filters
  const clearFilters = async () => {
    const clearedFilters = {
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      page: 1
    };
    setFilters(clearedFilters);
    await fetchProducts(clearedFilters);
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Update filters state
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const value = {
    products,
    loading,
    error,
    filters,
    pagination,
    fetchProducts,
    getProduct,
    searchProducts,
    filterByCategory,
    filterByPrice,
    filterByRating,
    clearFilters,
    updateFilters
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 