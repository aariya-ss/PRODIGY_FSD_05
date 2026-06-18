import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  ClipboardList, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save,
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  const { formatRupees } = useStore();

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'products'
  
  // Product modals states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Add mode, else object
  
  // Product Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Fruits & Vegetables');
  const [stock, setStock] = useState('10');
  const [featured, setFeatured] = useState(false);

  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  const fetchStatsAndProducts = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      const prodRes = await api.get('/products');
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Error fetching admin details:', err);
      setError('Failed to fetch administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndProducts();
  }, []);

  const handleShowNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Order Status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, null, {
        params: { status: newStatus }
      });
      handleShowNotification(`Order #${orderId.slice(0, 8)} updated to ${newStatus}`);
      fetchStatsAndProducts(); // refresh stats & recent orders
    } catch (err) {
      setError('Failed to update order status.');
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setCategory('Fruits & Vegetables');
    setStock('10');
    setFeatured(false);
    setShowProductModal(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description || '');
    setPrice(prod.price.toString());
    setOriginalPrice(prod.original_price.toString());
    setImageUrl(prod.image_url || '');
    setCategory(prod.category);
    setStock(prod.stock.toString());
    setFeatured(prod.featured);
    setShowProductModal(true);
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      handleShowNotification('Product deleted successfully');
      fetchStatsAndProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete product.');
    }
  };

  // Save product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      description,
      price: parseFloat(price),
      original_price: parseFloat(originalPrice),
      image_url: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      category,
      stock: parseInt(stock, 10),
      featured
    };

    try {
      if (editingProduct) {
        // Edit mode
        await api.put(`/products/${editingProduct.id}`, payload);
        handleShowNotification('Product updated successfully');
      } else {
        // Add mode
        await api.post('/products', payload);
        handleShowNotification('Product created successfully');
      }
      setShowProductModal(false);
      fetchStatsAndProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product details.');
    }
  };

  // Dummy Chart coordinates mapping (7 days trend)
  // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  const trendData = [3500, 5200, 4800, 6900, 8400, 7200, 9500];
  const maxVal = Math.max(...trendData);
  const chartPoints = trendData.map((val, idx) => {
    const x = (idx / (trendData.length - 1)) * 440 + 30; // map 0-6 to 30-470 px
    const y = 130 - (val / maxVal) * 90; // map value to Y coordinate (height 150)
    return { x, y, val };
  });

  const pathD = `M ${chartPoints[0].x} ${chartPoints[0].y} ` + 
    chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  const fillD = `${pathD} L ${chartPoints[chartPoints.length - 1].x} 140 L ${chartPoints[0].x} 140 Z`;

  if (loading) {
    return (
      <div className="py-12 animate-pulse space-y-8">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure catalogs, process local orders and analyze business health.
          </p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 p-1 rounded-xl bg-white dark:bg-slate-900">
          {['overview', 'orders', 'products'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications banner */}
      {notification && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-450 flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/50 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          
          {/* Metrics grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Revenue */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <span className="font-extrabold text-xl text-slate-900 dark:text-white mt-1 block">
                  {formatRupees(stats.total_sales)}
                </span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-650 dark:text-blue-400 shrink-0">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <span className="font-extrabold text-xl text-slate-900 dark:text-white mt-1 block">
                  {stats.total_orders}
                </span>
              </div>
            </div>

            {/* Active Catalog */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-650 dark:text-emerald-450 shrink-0">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items in Stock</span>
                <span className="font-extrabold text-xl text-slate-900 dark:text-white mt-1 block">
                  {stats.active_inventory_count}
                </span>
              </div>
            </div>

            {/* Stock warnings */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${
                stats.stock_alerts.length > 0 
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-450' 
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-400'
              }`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Alerts</span>
                <span className="font-extrabold text-xl text-slate-900 dark:text-white mt-1 block">
                  {stats.stock_alerts.length}
                </span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sales Trend Chart (Pure SVG) */}
            <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Sales Performance Trend (7 Days)
              </h3>
              
              <div className="relative">
                <svg viewBox="0 0 500 150" className="w-full h-auto overflow-visible">
                  {/* Grid Lines */}
                  <line x1="30" y1="40" x2="470" y2="40" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                  <line x1="30" y1="85" x2="470" y2="85" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                  <line x1="30" y1="130" x2="470" y2="130" stroke="#cbd5e1" strokeWidth="1" className="dark:stroke-slate-850" />

                  {/* Gradient Area Fill */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={fillD} fill="url(#chartGradient)" />

                  {/* Line path */}
                  <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

                  {/* Nodes & Tooltips */}
                  {chartPoints.map((p, idx) => (
                    <g key={idx}>
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="4.5" 
                        fill="#6366f1" 
                        stroke="white" 
                        strokeWidth="1.5"
                        className="cursor-pointer hover:r-6 hover:fill-emerald-500 transition-all dark:stroke-slate-900" 
                      />
                      {/* Price tag above node */}
                      <text 
                        x={p.x} 
                        y={p.y - 8} 
                        textAnchor="middle" 
                        fontSize="8" 
                        fontWeight="bold" 
                        fill="#4f46e5"
                        className="dark:fill-indigo-400 font-sans"
                      >
                        ₹{p.val}
                      </text>
                    </g>
                  ))}

                  {/* X Axis Labels */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <text
                      key={day}
                      x={chartPoints[idx].x}
                      y="148"
                      textAnchor="middle"
                      fontSize="9"
                      fill="#94a3b8"
                      className="font-bold"
                    >
                      {day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Stock Alert list sidebar */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                Critical Stock Alerts
              </h3>
              
              {stats.stock_alerts.length === 0 ? (
                <p className="text-xs text-emerald-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 font-semibold text-center">
                  All inventory levels healthy.
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {stats.stock_alerts.map((alert) => (
                    <div 
                      key={alert.product_id}
                      className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-350 line-clamp-1 max-w-[150px]">
                        {alert.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        alert.stock === 0 
                          ? 'bg-red-50 text-red-600 border border-red-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {alert.stock === 0 ? 'Out of Stock' : `${alert.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. ORDERS MANAGEMENT TAB */}
      {activeTab === 'orders' && stats && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-bold text-sm text-slate-950 dark:text-white">Active Order Registry</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-955 text-slate-550 border-b border-slate-150 dark:border-slate-850">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Delivery Address</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Grand Total</th>
                  <th className="p-4 font-bold text-center">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {stats.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={order.delivery_address}>
                      {order.delivery_address}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-350">{order.contact_phone}</td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                      {formatRupees(order.total_amount)}
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-350 cursor-pointer"
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PRODUCTS TAB (CRUD) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-950 dark:text-white">Product Catalog</h3>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-955 text-slate-550 border-b border-slate-150 dark:border-slate-850">
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-855">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-50 border border-slate-100"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[150px]">
                            {prod.name}
                          </span>
                          {prod.featured && (
                            <span className="inline-block text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded uppercase tracking-wider mt-0.5">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{prod.category}</td>
                      <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                        {formatRupees(prod.price)}
                      </td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-350">{prod.stock} units</td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-650 cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* PRODUCT CREATION/UPDATE MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Title */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Catalog Item' : 'Add New Catalog Item'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-655">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Product Name */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Strawberries (250g)"
                  className="w-full mt-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-indigo-500 outline-none text-white"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-indigo-500 outline-none text-white"
                >
                  <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                </select>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="120"
                    className="w-full mt-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-indigo-500 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Original (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="150"
                    className="w-full mt-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-indigo-500 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="20"
                    className="w-full mt-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-indigo-500 outline-none text-white"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://unsplash.com/..."
                  className="w-full mt-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-indigo-500 outline-none text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Details about product sourcing or weight..."
                  className="w-full mt-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-indigo-500 outline-none text-white"
                />
              </div>

              {/* Featured Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="accent-indigo-650 h-4.5 w-4.5"
                />
                <div>
                  <span className="block font-bold text-xs text-slate-900 dark:text-white">Feature on Landing Page</span>
                  <span className="block text-[10px] text-slate-400">Displays product inside the 'Featured Local Picks' slider grid.</span>
                </div>
              </label>

              {/* Save actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm transition-all"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
