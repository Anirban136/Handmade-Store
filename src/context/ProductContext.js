import React, { createContext, useContext, useState, useEffect } from 'react';

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
      
      // Fetch products from backend API
      const response = await fetch('https://handycurv-backend.onrender.com/api/products');
      
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
  };

  // Get single product
  const getProduct = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch single product from backend API
      const response = await fetch(`https://handycurv-backend.onrender.com/api/products/${id}`);
      
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