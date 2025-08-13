import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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

  // Memoize the fetchProducts function to prevent unnecessary re-renders
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products from backend API
      const response = await fetch('http://localhost:8000/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      let allProducts = data.products || [];
      
      // Apply keyword filter
      if (params.keyword) {
        allProducts = allProducts.filter(product =>
          product.name.toLowerCase().includes(params.keyword.toLowerCase()) ||
          product.description.toLowerCase().includes(params.keyword.toLowerCase())
        );
      }
      
      // Apply category filter
      if (params.category && params.category !== 'All') {
        allProducts = allProducts.filter(product =>
          product.category === params.category
        );
      }
      
      // Apply price filters
      if (params.minPrice) {
        allProducts = allProducts.filter(product =>
          product.price >= parseInt(params.minPrice)
        );
      }
      
      if (params.maxPrice) {
        allProducts = allProducts.filter(product =>
          product.price <= parseInt(params.maxPrice)
        );
      }
      
      // Apply rating filter
      if (params.rating) {
        allProducts = allProducts.filter(product =>
          product.rating >= parseInt(params.rating)
        );
      }
      
      setProducts(allProducts);
      setPagination({
        currentPage: parseInt(params.page) || 1,
        totalPages: Math.ceil(allProducts.length / 8),
        totalProducts: allProducts.length,
        productsPerPage: 8
      });
      
      return {
        products: allProducts,
        productsCount: allProducts.length,
        resPerPage: 8
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      // Fallback to empty products if API fails
      setProducts([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        productsPerPage: 8
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a refresh function to manually refresh products
  const refreshProducts = useCallback(async () => {
    console.log('🔄 Manually refreshing products...');
    try {
      setLoading(true);
      const result = await fetchProducts();
      console.log('✅ Products refreshed successfully:', result.productsCount, 'products found');
      return result;
    } catch (error) {
      console.error('❌ Error refreshing products:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Memoize other functions to prevent re-renders
  const searchProducts = useCallback(async (keyword) => {
    await fetchProducts({ keyword, page: 1 });
  }, [fetchProducts]);

  const filterByCategory = useCallback(async (category) => {
    await fetchProducts({ category, page: 1 });
  }, [fetchProducts]);

  const filterByPrice = useCallback(async (minPrice, maxPrice) => {
    await fetchProducts({ minPrice, maxPrice, page: 1 });
  }, [fetchProducts]);

  const filterByRating = useCallback(async (rating) => {
    await fetchProducts({ rating, page: 1 });
  }, [fetchProducts]);

  const clearFilters = useCallback(async () => {
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
  }, [fetchProducts]);

  // Get single product
  const getProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch single product from backend API
      const response = await fetch(`http://localhost:8000/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      const data = await response.json();
      return { product: data.product };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters state
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Load products only once on component mount
  useEffect(() => {
    // Create a local function to avoid dependency issues
    const loadInitialProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8000/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        const allProducts = data.products || [];
        
        setProducts(allProducts);
        setPagination({
          currentPage: 1,
          totalPages: Math.ceil(allProducts.length / 8),
          totalProducts: allProducts.length,
          productsPerPage: 8
        });
      } catch (error) {
        console.error('Error loading initial products:', error);
        setError(error.message);
        setProducts([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalProducts: 0,
          productsPerPage: 8
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialProducts();
    
    // Set up periodic refresh every 30 seconds to keep data in sync
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing products...');
      loadInitialProducts();
    }, 30000); // 30 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only once

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
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
    updateFilters,
    refreshProducts
  }), [
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
    updateFilters,
    refreshProducts
  ]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 