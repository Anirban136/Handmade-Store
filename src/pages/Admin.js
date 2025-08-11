import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaStar, FaEye, FaUsers, FaBox, FaShoppingCart, FaChartBar } from 'react-icons/fa';
import './Admin.css';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    isActive: true,
    featured: false
  });

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
      return;
    }
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [productsRes, usersRes, ordersRes, statsRes] = await Promise.all([
        fetch('https://handycurv-backend.onrender.com/api/admin/products'),
        fetch('https://handycurv-backend.onrender.com/api/admin/users'),
        fetch('https://handycurv-backend.onrender.com/api/admin/orders'),
        fetch('https://handycurv-backend.onrender.com/api/admin/stats')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || {});
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingProduct 
        ? `https://handycurv-backend.onrender.com/api/admin/products/${editingProduct.id}`
        : 'https://handycurv-backend.onrender.com/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        const result = await response.json();
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowProductForm(false);
        setEditingProduct(null);
        resetProductForm();
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      isActive: product.isActive,
      featured: product.featured
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`https://handycurv-backend.onrender.com/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const toggleFeatured = async (productId, currentFeatured) => {
    try {
      const response = await fetch(`https://handycurv-backend.onrender.com/api/admin/products/${productId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured: !currentFeatured })
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        alert('Failed to update featured status');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Failed to update featured status');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      isActive: true,
      featured: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  if (loading) {
    return <div className="admin-loading">Loading admin panel...</div>;
  }

  if (error) {
    return <div className="admin-error">Error: {error}</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FaChartBar /> Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <FaBox /> Products
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> Users
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FaShoppingCart /> Orders
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="admin-dashboard">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>{stats.totalUsers || 0}</h3>
                <p>Total Users</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaBox />
              </div>
              <div className="stat-content">
                <h3>{stats.totalProducts || 0}</h3>
                <p>Total Products</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaShoppingCart />
              </div>
              <div className="stat-content">
                <h3>{stats.totalOrders || 0}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaStar />
              </div>
              <div className="stat-content">
                <h3>₹{stats.totalRevenue || 0}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <button 
              className="action-btn"
              onClick={() => setActiveTab('products')}
            >
              <FaPlus /> Add New Product
            </button>
            <button 
              className="action-btn"
              onClick={() => setActiveTab('users')}
            >
              <FaUsers /> View Users
            </button>
            <button 
              className="action-btn"
              onClick={() => setActiveTab('orders')}
            >
              <FaShoppingCart /> Manage Orders
            </button>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="admin-products">
          <div className="section-header">
            <h2>Product Management</h2>
            <button 
              className="add-btn"
              onClick={() => {
                setEditingProduct(null);
                resetProductForm();
                setShowProductForm(true);
              }}
            >
              <FaPlus /> Add Product
            </button>
          </div>

          {showProductForm && (
            <div className="product-form-overlay">
              <div className="product-form">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleProductSubmit}>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        name="price"
                        value={productForm.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={productForm.stock}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Pottery">Pottery</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Woodwork">Woodwork</option>
                      <option value="Glass">Glass</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={productForm.isActive}
                          onChange={handleInputChange}
                        />
                        Active
                      </label>
                    </div>
                    
                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="featured"
                          checked={productForm.featured}
                          onChange={handleInputChange}
                        />
                        Featured
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                        resetProductForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                        alt={product.name}
                        className="product-thumbnail"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status ${product.isActive ? 'active' : 'inactive'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`featured-btn ${product.featured ? 'featured' : ''}`}
                        onClick={() => toggleFeatured(product.id, product.featured)}
                        title={product.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <FaStar />
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditProduct(product)}
                          title="Edit product"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete product"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-users">
          <h2>User Management</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="admin-orders">
          <h2>Order Management</h2>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td>₹{order.totalAmount || 0}</td>
                    <td>
                      <span className={`status ${order.orderStatus}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 