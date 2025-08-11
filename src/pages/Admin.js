import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaStar, FaEye, FaUsers, FaBox, FaShoppingCart, FaChartBar, FaTimes, FaUpload, FaImage } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const API_BASE_URL = 'https://handycurv-backend.onrender.com/api/admin';

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
    featured: false,
    images: []
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState('auto');
  const [customDimensions, setCustomDimensions] = useState({ width: '', height: '' });
  const [showCompressionSettings, setShowCompressionSettings] = useState(false);

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
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/orders`),
        fetch(`${API_BASE_URL}/stats`)
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
    setIsLoading(true);
    
    try {
      // Prepare product data without images first
      const productData = {
        ...productForm,
        images: [] // Start with empty images array
      };
      
      if (editingProduct) {
        // Update existing product
        const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        
        if (response.ok) {
          // If there are uploaded files, upload them now
          if (uploadedFiles.length > 0) {
            await uploadFiles(editingProduct.id);
          }
          
          setShowProductForm(false);
          setEditingProduct(null);
          fetchData();
          alert('Product updated successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } else {
        // Create new product first
        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        
        if (response.ok) {
          const result = await response.json();
          const newProductId = result.product.id;
          
          // If there are uploaded files, upload them to the new product
          if (uploadedFiles.length > 0) {
            await uploadFiles(newProductId);
          }
          
          setShowProductForm(false);
          fetchData();
          alert('Product created successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // File upload functions
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFiles = async (productId) => {
    if (uploadedFiles.length === 0) return;
    
    console.log('Starting file upload for product:', productId);
    console.log('Files to upload:', uploadedFiles);
    
    setIsUploading(true);
    const formData = new FormData();
    
    uploadedFiles.forEach((fileObj, index) => {
      formData.append('images', fileObj.file);
      console.log(`Adding file ${index}:`, fileObj.name, fileObj.size);
    });
    
    // Add compression settings
    formData.append('compressionQuality', compressionQuality);
    if (customDimensions.width) formData.append('maxWidth', customDimensions.width);
    if (customDimensions.height) formData.append('maxHeight', customDimensions.height);
    
    console.log('Compression settings:', { compressionQuality, customDimensions });
    
    try {
      const uploadUrl = `${API_BASE_URL}/products/${productId}/upload-images`;
      console.log('Uploading to:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        
        // Update the product with new images
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, ...result.product.images.slice(-uploadedFiles.length)]
        }));
        setUploadedFiles([]);
        
        // Show compression results
        if (result.compression) {
          const successCount = result.compression.successful;
          const totalCount = result.compression.totalImages;
          const avgCompression = result.compression.results
            .filter(r => r.success && r.compressionRatio)
            .reduce((sum, r) => sum + parseFloat(r.compressionRatio), 0) / successCount || 0;
          
          alert(`Images uploaded successfully!\n\n📊 Compression Results:\n• ${successCount}/${totalCount} images compressed\n• Average compression: ${avgCompression.toFixed(1)}%\n• Format: WebP for better quality`);
        } else {
          alert('Images uploaded successfully!');
        }
      } else if (response.status === 404) {
        // Backend doesn't have compression features yet, try basic upload
        console.log('Compression endpoint not found, trying basic upload...');
        await basicImageUpload(productId);
      } else {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status);
        console.error('Error response:', errorText);
        
        let errorMessage = 'Upload failed';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `Upload failed with status ${response.status}`;
        }
        
        alert(`Upload failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Fallback for basic image upload when compression features aren't available
  const basicImageUpload = async (productId) => {
    try {
      console.log('Attempting basic image upload...');
      
      // For now, we'll just add the files to the form and let them be saved with the product
      // This is a temporary solution until the backend compression is deployed
      const fileUrls = uploadedFiles.map(fileObj => ({
        url: URL.createObjectURL(fileObj.file),
        name: fileObj.name,
        isLocal: true
      }));
      
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...fileUrls]
      }));
      
      setUploadedFiles([]);
      alert('Images added to product (basic mode - compression not available yet)');
      
    } catch (error) {
      console.error('Basic upload error:', error);
      alert('Basic upload failed. Please try again.');
    }
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
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
      featured: product.featured,
      images: product.images || [] // Assuming product.images is an array of URLs
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
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
      const response = await fetch(`${API_BASE_URL}/products/${productId}/featured`, {
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
      featured: false,
      images: []
    });
    setImageUrls([]); // Clear image URLs
    setNewImageUrl(''); // Clear new image URL
    setUploadedFiles([]); // Clear uploaded files
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

                  {/* Image Upload Section */}
                  <div className="form-group">
                    <label>Product Images</label>
                    <div className="image-upload-container">
                      <div className="image-upload-instructions">
                        <p><strong>📸 Image Upload Options:</strong></p>
                        <ul>
                          <li><strong>Option 1:</strong> Upload files directly (drag & drop or click to select)</li>
                          <li><strong>Option 2:</strong> Add image URLs from external sources</li>
                          <li>Supported formats: JPG, PNG, WebP, GIF (max 5MB each)</li>
                          <li>First image will be the main product image</li>
                          <li>You can add multiple images for different angles</li>
                        </ul>
                      </div>
                      
                      {/* File Upload Section */}
                      <div className="file-upload-section">
                        <h4>📁 Upload Files:</h4>
                        
                        {/* Compression Settings */}
                        <div className="compression-settings">
                          <button 
                            type="button" 
                            className="compression-toggle-btn"
                            onClick={() => setShowCompressionSettings(!showCompressionSettings)}
                          >
                            <FaImage /> Compression Settings {showCompressionSettings ? '▼' : '▶'}
                          </button>
                          
                          {showCompressionSettings && (
                            <div className="compression-options">
                              <div className="compression-quality">
                                <label>Compression Quality:</label>
                                <select 
                                  value={compressionQuality} 
                                  onChange={(e) => setCompressionQuality(e.target.value)}
                                >
                                  <option value="auto">🤖 Auto (Smart Detection)</option>
                                  <option value="high">🔥 High (70% - Small files, fast loading)</option>
                                  <option value="medium">⚡ Medium (85% - Balanced quality/size)</option>
                                  <option value="low">💎 Low (95% - High quality, larger files)</option>
                                </select>
                              </div>
                              
                              <div className="custom-dimensions">
                                <label>Custom Dimensions (optional):</label>
                                <div className="dimension-inputs">
                                  <input
                                    type="number"
                                    placeholder="Max Width (px)"
                                    value={customDimensions.width}
                                    onChange={(e) => setCustomDimensions(prev => ({ ...prev, width: e.target.value }))}
                                    min="100"
                                    max="2000"
                                  />
                                  <span>×</span>
                                  <input
                                    type="number"
                                    placeholder="Max Height (px)"
                                    value={customDimensions.height}
                                    onChange={(e) => setCustomDimensions(prev => ({ ...prev, height: e.target.value }))}
                                    min="100"
                                    max="2000"
                                  />
                                </div>
                                <small>Leave empty to use quality-based auto-sizing</small>
                              </div>
                              
                              <div className="compression-info">
                                <p><strong>💡 Smart Features:</strong></p>
                                <ul>
                                  <li>🔄 Automatic format conversion to WebP</li>
                                  <li>📐 Smart resizing with aspect ratio preservation</li>
                                  <li>🎯 Quality-based compression recommendations</li>
                                  <li>🧹 Original files automatically cleaned up</li>
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div 
                          className={`drag-drop-zone ${dragActive ? 'drag-active' : ''}`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="file-input"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload" className="file-input-label">
                            <FaUpload className="upload-icon" />
                            <span>Drag & drop images here or click to select</span>
                            <small>Max 10 images, 10MB each (will be compressed)</small>
                          </label>
                        </div>
                        
                        {/* Uploaded Files Preview */}
                        {uploadedFiles.length > 0 && (
                          <div className="uploaded-files">
                            <h5>Selected Files ({uploadedFiles.length}):</h5>
                            <div className="file-preview-grid">
                              {uploadedFiles.map((fileObj) => (
                                <div key={fileObj.id} className="file-preview-item">
                                  <img src={fileObj.preview} alt={fileObj.name} />
                                  <div className="file-info">
                                    <span className="file-name">{fileObj.name}</span>
                                    <span className="file-size">{(fileObj.size / 1024 / 1024).toFixed(2)} MB</span>
                                  </div>
                                  <button 
                                    className="remove-file-btn"
                                    onClick={() => removeUploadedFile(fileObj.id)}
                                    title="Remove file"
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button 
                              type="button" 
                              className="upload-files-btn"
                              onClick={() => uploadFiles(editingProduct?.id || 'new')}
                              disabled={isUploading}
                            >
                              {isUploading ? 'Uploading...' : <><FaUpload /> Upload Files</>}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* URL Input Section */}
                      <div className="url-input-section">
                        <h4>🔗 Add Image URLs:</h4>
                        {imageUrls.length > 0 && (
                          <div className="existing-images">
                            <h5>Current URLs ({imageUrls.length}):</h5>
                            {imageUrls.map((url, index) => (
                              <div key={index} className="existing-image-item">
                                <img src={url} alt={`Product ${productForm.name}`} />
                                <div className="image-order-badge">{index + 1}</div>
                                <button 
                                  className="remove-image-btn"
                                  onClick={() => {
                                    const newImageUrls = imageUrls.filter((_, i) => i !== index);
                                    setImageUrls(newImageUrls);
                                    setProductForm(prev => ({
                                      ...prev,
                                      images: newImageUrls
                                    }));
                                  }}
                                  title="Remove image"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="add-image-section">
                          <input
                            type="url"
                            name="newImageUrl"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                            className="image-url-input"
                          />
                          <button 
                            type="button" 
                            className="add-image-btn"
                            onClick={() => {
                              if (newImageUrl) {
                                setImageUrls(prev => [...prev, newImageUrl]);
                                setProductForm(prev => ({
                                  ...prev,
                                  images: [...prev.images, newImageUrl]
                                }));
                                setNewImageUrl('');
                              }
                            }}
                            disabled={!newImageUrl}
                          >
                            <FaPlus /> Add URL
                          </button>
                        </div>
                      </div>
                      
                      {/* Combined Images Display */}
                      {(imageUrls.length > 0 || uploadedFiles.length > 0) && (
                        <div className="combined-images">
                          <h4>📋 All Product Images:</h4>
                          <div className="combined-images-grid">
                            {imageUrls.map((url, index) => (
                              <div key={`url-${index}`} className="combined-image-item">
                                <img src={url} alt={`Product ${productForm.name}`} />
                                <div className="image-order-badge">{index + 1}</div>
                                <span className="image-source">URL</span>
                              </div>
                            ))}
                            {uploadedFiles.map((fileObj, index) => (
                              <div key={`file-${fileObj.id}`} className="combined-image-item">
                                <img src={fileObj.preview} alt={fileObj.name} />
                                <div className="image-order-badge">{imageUrls.length + index + 1}</div>
                                <span className="image-source">File</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(imageUrls.length === 0 && uploadedFiles.length === 0) && (
                        <div className="no-images-warning">
                          <p>⚠️ At least one image is required for the product</p>
                        </div>
                      )}
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
                      <div className="product-images-preview">
                        {product.images && product.images.length > 0 ? (
                          product.images.slice(0, 3).map((image, index) => (
                            <img 
                              key={index}
                              src={image.url} 
                              alt={`${product.name} ${index + 1}`}
                              className="product-thumbnail"
                              title={`${product.name} - Image ${index + 1}`}
                            />
                          ))
                        ) : (
                          <div className="no-image-placeholder">No Image</div>
                        )}
                        {product.images && product.images.length > 3 && (
                          <div className="more-images-indicator">
                            +{product.images.length - 3} more
                          </div>
                        )}
                      </div>
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