import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Check, DollarSign, Package, Users, ShoppingCart, RefreshCw, X, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../services/api';

// Initial local mocks for fallback
const INITIAL_PRODUCTS = [
  { id: '1', name: 'Classic Blue Denim Jacket', description: 'A timeless classic denim jacket crafted from premium blue cotton.', price: 89.99, category: 'Apparel', stock: 25, image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', featured: true },
  { id: '2', name: 'Premium Wireless Headphones', description: 'Immerse yourself in rich, high-fidelity sound.', price: 199.99, category: 'Electronics', stock: 15, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', featured: true },
  { id: '3', name: 'Ergonomic Office Chair', description: 'Upgrade your work setup with lumbar mesh support.', price: 249.50, category: 'Furniture', stock: 0, image_url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80', featured: false },
  { id: '4', name: 'Stainless Steel Water Bottle', description: 'Double-walled vacuum insulated water bottle.', price: 24.99, category: 'Accessories', stock: 50, image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', featured: true },
  { id: '5', name: 'Minimalist Leather Wallet', description: 'RFID-blocking card holder wallet.', price: 39.99, category: 'Accessories', stock: 35, image_url: 'https://images.unsplash.com/photo-1627124118974-1d80dd4c9447?w=600&auto=format&fit=crop&q=80', featured: false }
];

const INITIAL_ORDERS = [
  { id: 'ord-1', total_amount: 114.98, status: 'shipped', created_at: '2026-07-03T10:00:00Z', items: [{ product_name: 'Classic Denim', quantity: 1, price_at_purchase: 89.99 }] },
  { id: 'ord-2', total_amount: 199.99, status: 'delivered', created_at: '2026-07-02T12:00:00Z', items: [{ product_name: 'Headphones', quantity: 1, price_at_purchase: 199.99 }] },
  { id: 'ord-3', total_amount: 24.99, status: 'pending', created_at: '2026-07-04T15:30:00Z', items: [{ product_name: 'Water Bottle', quantity: 1, price_at_purchase: 24.99 }] }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, orders
  
  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form / Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Apparel', stock: '', image_url: '', featured: false
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch all products and orders
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/products', { params: { size: 100 } });
      setProducts(prodRes.data.items);
      
      const orderRes = await api.get('/orders');
      setOrders(orderRes.data);
    } catch (err) {
      console.warn('Backend offline. Loading local dashboard sandbox mocks.', err);
      // Retrieve from localStorage or set defaults
      const storedProds = localStorage.getItem('sandbox_products');
      if (storedProds) {
        setProducts(JSON.parse(storedProds));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('sandbox_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      const storedOrders = localStorage.getItem('local_orders');
      const ordersList = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;
      setOrders(ordersList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '', description: '', price: '', category: 'Apparel', stock: '', image_url: '', featured: false
    });
    setErrorMsg('');
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      stock: product.stock,
      image_url: product.image_url || '',
      featured: product.featured || false
    });
    setErrorMsg('');
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const formattedPayload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10)
    };

    if (isNaN(formattedPayload.price) || formattedPayload.price <= 0) {
      setErrorMsg('Price must be a valid positive number.');
      return;
    }
    if (isNaN(formattedPayload.stock) || formattedPayload.stock < 0) {
      setErrorMsg('Stock must be a non-negative integer.');
      return;
    }

    try {
      if (editingProduct) {
        // Edit API request
        const res = await api.put(`/products/${editingProduct.id}`, formattedPayload);
        setProducts(products.map((p) => (p.id === editingProduct.id ? res.data : p)));
        setSuccessMsg('Product updated successfully!');
      } else {
        // Create API request
        const res = await api.post('/products', formattedPayload);
        setProducts([res.data, ...products]);
        setSuccessMsg('Product created successfully!');
      }
      setShowProductModal(false);
    } catch (err) {
      console.warn('API Product update failed. Updating local storage sandbox...', err);
      // Offline fallback: update in localStorage
      let updatedList = [...products];
      if (editingProduct) {
        const updatedItem = { ...editingProduct, ...formattedPayload };
        updatedList = products.map((p) => (p.id === editingProduct.id ? updatedItem : p));
        setSuccessMsg('Product updated locally (offline)');
      } else {
        const newItem = {
          id: Math.random().toString(36).substring(2, 11),
          created_at: new Date().toISOString(),
          ...formattedPayload
        };
        updatedList = [newItem, ...products];
        setSuccessMsg('Product created locally (offline)');
      }
      setProducts(updatedList);
      localStorage.setItem('sandbox_products', JSON.stringify(updatedList));
      setShowProductModal(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter((p) => p.id !== productId));
      setSuccessMsg('Product deleted successfully!');
    } catch (err) {
      console.warn('API Product deletion failed. Deleting from local sandbox...', err);
      const updatedList = products.filter((p) => p.id !== productId);
      setProducts(updatedList);
      localStorage.setItem('sandbox_products', JSON.stringify(updatedList));
      setSuccessMsg('Product deleted locally (offline)');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o.id === orderId ? res.data : o)));
      setSuccessMsg(`Order marked as ${newStatus}`);
    } catch (err) {
      console.warn('API Order status patch failed. Updating local sandbox...', err);
      const updatedList = orders.map((o) => 
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      setOrders(updatedList);
      localStorage.setItem('local_orders', JSON.stringify(updatedList));
      setSuccessMsg(`Order marked as ${newStatus} locally (offline)`);
    }
  };

  // Metrics calculations
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + Number(o.total_amount) : sum, 0);
  const totalOrdersCount = orders.length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  
  // Custom SVG Chart Data setup (Sales per category)
  const categorySales = {};
  orders.forEach((o) => {
    if (o.status === 'cancelled') return;
    if (o.items) {
      o.items.forEach((item) => {
        // Guessing category or group
        const price = Number(item.price_at_purchase) * item.quantity;
        const matchingProduct = products.find(p => p.name === item.product_name || p.id === item.product_id);
        const cat = matchingProduct?.category || 'Apparel';
        categorySales[cat] = (categorySales[cat] || 0) + price;
      });
    }
  });

  const categoriesList = ['Electronics', 'Apparel', 'Accessories', 'Furniture'];
  const maxSales = Math.max(...categoriesList.map((c) => categorySales[c] || 1), 10);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-6">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Control Panel</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Store inventory metrics, sales performance, and order tracking pipeline.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-850 px-4 py-2 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs flex justify-between items-center">
          <span className="font-semibold">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 gap-4">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Overview & Charts
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Manage Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Order Pipeline ({orders.length})
        </button>
      </div>

      {/* --- ANALYTICS VIEW --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Card Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Revenue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-xs">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <DollarSign size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Revenue</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">${totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-xs">
              <div className="p-3.5 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl">
                <ShoppingCart size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Orders</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalOrdersCount}</span>
              </div>
            </div>

            {/* Catalog Items */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-xs">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-650 rounded-xl">
                <Package size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Products</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{products.length}</span>
              </div>
            </div>

            {/* Out of Stock warnings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-xs">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Out of Stock</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{outOfStockCount}</span>
              </div>
            </div>

          </div>

          {/* SVG Canvas-free Chart (Category sales breakdown) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 pb-6">
              <TrendingUp className="text-primary-600" size={20} /> Sales by Category ($ USD)
            </h2>
            
            {/* Native Inline SVG Chart */}
            <div className="w-full aspect-[2/1] md:aspect-[3/1] relative">
              <svg className="w-full h-full" viewBox="0 0 600 200">
                {/* Y-axis gridlines */}
                <line x1="50" y1="20" x2="550" y2="20" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800" />
                <line x1="50" y1="80" x2="550" y2="80" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800" />
                <line x1="50" y1="140" x2="550" y2="140" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800" />
                <line x1="50" y1="170" x2="550" y2="170" stroke="#94a3b8" className="dark:stroke-slate-700" />

                {/* Render Bars */}
                {categoriesList.map((cat, idx) => {
                  const sales = categorySales[cat] || 0;
                  const barHeight = (sales / maxSales) * 130; // map to svg space (max height 130)
                  const x = 80 + idx * 120;
                  const y = 170 - barHeight;

                  return (
                    <g key={cat} className="group">
                      {/* Bar shadow/glow */}
                      <rect
                        x={x}
                        y={y}
                        width="40"
                        height={barHeight}
                        rx="6"
                        className="fill-primary-500/25 dark:fill-primary-400/25 blur-[1px]"
                      />
                      {/* Real Bar */}
                      <rect
                        x={x}
                        y={y}
                        width="40"
                        height={barHeight}
                        rx="6"
                        className="fill-primary-600 dark:fill-primary-500 cursor-pointer hover:fill-primary-700 transition-all duration-300"
                      />
                      
                      {/* Sales value bubble text */}
                      <text
                        x={x + 20}
                        y={y - 8}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-slate-800 dark:fill-slate-200"
                      >
                        ${sales.toFixed(0)}
                      </text>

                      {/* X-axis Label */}
                      <text
                        x={x + 20}
                        y="185"
                        textAnchor="middle"
                        className="text-[10px] font-semibold fill-slate-500 dark:fill-slate-400"
                      >
                        {cat}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

        </div>
      )}

      {/* --- INVENTORY LISTING VIEW --- */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Store Catalog</h2>
            <button
              onClick={openAddModal}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-98"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Product details</th>
                    <th className="py-4 px-6 text-center">Category</th>
                    <th className="py-4 px-6 text-right">Price</th>
                    <th className="py-4 px-6 text-center">Stock</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 px-6">
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=80'}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-100 dark:border-slate-800"
                        />
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-950 dark:text-white max-w-[200px] truncate">
                        <div>
                          <p className="font-bold line-clamp-1">{p.name}</p>
                          {p.featured && (
                            <span className="inline-block mt-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-primary-100 dark:bg-primary-950/20 text-primary-600 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{p.category}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-850 dark:text-slate-200">${Number(p.price).toFixed(2)}</td>
                      <td className="py-4 px-6 text-center font-bold">
                        <span className={p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ORDER PIPELINE VIEW --- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">Store Order Pipeline</h2>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Created date</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Progress Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {orders.map((o) => {
                    const isCancelled = o.status === 'cancelled';
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-bold select-all">
                          #{o.id.substring(0, 8)}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                          {new Date(o.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right font-extrabold text-slate-850 dark:text-slate-200">
                          ${Number(o.total_amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isCancelled
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-650'
                              : o.status === 'delivered'
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650'
                              : 'bg-primary-50 dark:bg-primary-950/20 text-primary-600'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {!isCancelled ? (
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-semibold focus:outline-hidden cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancel Order</option>
                            </select>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold italic">Order Cancelled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowProductModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-slideUp max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-lg">
                {editingProduct ? 'Edit Product details' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-650 border border-red-200 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              
              <div>
                <label className="block uppercase tracking-wider mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mechanical Gaming Keyboard"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-primary-500 text-slate-850 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details, utility specifications, key highlights..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-primary-500 text-slate-850 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-hidden text-slate-850 dark:text-slate-200"
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Featured Item</label>
                  <div className="flex items-center h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-slate-50/50 dark:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="ml-2 font-medium text-slate-600">Promote to Hero</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99.99"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-primary-500 text-slate-850 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1.5">Inventory Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-primary-500 text-slate-850 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-primary-500 text-slate-850 dark:text-slate-200"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-800 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
