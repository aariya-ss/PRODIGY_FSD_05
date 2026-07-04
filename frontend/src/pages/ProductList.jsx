import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, ChevronLeft, ChevronRight, X, SlidersHorizontal, Sliders } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';

// Local mock products database for fallback
const ALL_MOCK_PRODUCTS = [
  { id: '1', name: 'Classic Blue Denim Jacket', description: 'A timeless classic denim jacket crafted from premium blue cotton.', price: 89.99, category: 'Apparel', stock: 25, image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', featured: true, created_at: '2026-07-01T00:00:00Z' },
  { id: '2', name: 'Premium Wireless Headphones', description: 'Immerse yourself in rich, high-fidelity sound. Features active noise cancellation.', price: 199.99, category: 'Electronics', stock: 15, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', featured: true, created_at: '2026-07-02T00:00:00Z' },
  { id: '3', name: 'Ergonomic Office Chair', description: 'Upgrade your work-from-home setup with our premium ergonomic office chair.', price: 249.50, category: 'Furniture', stock: 10, image_url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80', featured: false, created_at: '2026-07-03T00:00:00Z' },
  { id: '4', name: 'Stainless Steel Water Bottle', description: 'Double-walled vacuum insulated water bottle that keeps your drinks ice cold.', price: 24.99, category: 'Accessories', stock: 50, image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', featured: true, created_at: '2026-07-04T00:00:00Z' },
  { id: '5', name: 'Minimalist Leather Wallet', description: 'Sleek RFID-blocking card holder wallet crafted from genuine full-grain leather.', price: 39.99, category: 'Accessories', stock: 35, image_url: 'https://images.unsplash.com/photo-1627124118974-1d80dd4c9447?w=600&auto=format&fit=crop&q=80', featured: false, created_at: '2026-07-05T00:00:00Z' },
  { id: '6', name: 'Mechanical Gaming Keyboard', description: 'Tactile blue switches, customizable RGB backlighting, full anti-ghosting keys.', price: 79.99, category: 'Electronics', stock: 20, image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80', featured: false, created_at: '2026-07-06T00:00:00Z' }
];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filtering & pagination state
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Retrieve parameters from URL
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const featured = searchParams.get('featured') === 'true';

  const categories = ['Electronics', 'Apparel', 'Accessories', 'Furniture'];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 8,
        sort,
      };
      if (query) params.q = query;
      if (category) params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (featured) params.featured = true;

      const response = await api.get('/products', { params });
      setProducts(response.data.items);
      setTotalCount(response.data.total);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.warn('Failed to load products from backend. Filtering local mocks.', err);
      // Run filtering locally on mocks
      let filtered = [...ALL_MOCK_PRODUCTS];

      if (query) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) || 
          p.description.toLowerCase().includes(query.toLowerCase())
        );
      }
      if (category) {
        filtered = filtered.filter(p => p.category === category);
      }
      if (minPrice) {
        filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
      }
      if (featured) {
        filtered = filtered.filter(p => p.featured === true);
      }

      // Sorting mock
      if (sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'name_asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else { // newest
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      // Mock Pagination
      const size = 8;
      const pages = Math.ceil(filtered.length / size) || 1;
      const offset = (page - 1) * size;
      
      setProducts(filtered.slice(offset, offset + size));
      setTotalCount(filtered.length);
      setTotalPages(pages);
    } finally {
      setLoading(false);
    }
  }, [query, category, minPrice, maxPrice, sort, page, featured]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // reset page on filter change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Our Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Showing {products.length} of {totalCount} quality products.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => updateParam('q', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-hidden focus:border-primary-500 transition-colors shadow-xs"
          />
          {query && (
            <button
              onClick={() => updateParam('q', '')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters
              </span>
              {(category || minPrice || maxPrice || featured) && (
                <button onClick={clearAllFilters} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  Clear All
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left text-sm py-1.5 px-3 rounded-lg font-medium transition-all ${
                    !category
                      ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateParam('category', cat)}
                    className={`w-full text-left text-sm py-1.5 px-3 rounded-lg font-medium transition-all ${
                      category === cat
                        ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Ranges */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParam('min_price', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-center"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParam('max_price', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-center"
                  />
                </div>
              </div>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Featured Only</span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                className="w-4.5 h-4.5 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
            </div>

          </div>
        </aside>

        {/* PRODUCT GRID & CONTROLS */}
        <div className="flex-grow space-y-6">
          {/* Top sorting controls */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl py-3 px-6 shadow-xs">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              <Filter size={16} /> Filters
            </button>
            <div className="hidden lg:block text-xs font-semibold text-slate-500">
              Showing {products.length} of {totalCount} results
            </div>

            {/* Sort Selection */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-primary-500 cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Grid Area */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <Sliders size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Products Found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                No items match your selected filters. Try clearing some parameters or refining your search string.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-xl mt-6 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => updateParam('page', page - 1)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateParam('page', pageNum)}
                        className={`w-9 h-9 text-xs font-semibold rounded-xl transition-all ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={page === totalPages}
                    onClick={() => updateParam('page', page + 1)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* MOBILE FILTERS DRAWER / MODAL */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          {/* Overlay */}
          <div onClick={() => setShowMobileFilters(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" />
          
          {/* Drawer Body */}
          <div className="relative w-80 max-w-xs h-full bg-white dark:bg-slate-950 p-6 flex flex-col gap-6 shadow-2xl animate-slideLeft overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Filters</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => { updateParam('category', ''); setShowMobileFilters(false); }}
                  className={`w-full text-left text-sm py-2 px-3 rounded-lg font-medium ${
                    !category ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { updateParam('category', cat); setShowMobileFilters(false); }}
                    className={`w-full text-left text-sm py-2 px-3 rounded-lg font-medium ${
                      category === cat ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Ranges */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('min_price', e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-center"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('max_price', e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-center"
                />
              </div>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Featured Only</span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                className="w-4.5 h-4.5 text-primary-600 rounded focus:ring-primary-500"
              />
            </div>

            {/* Actions */}
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => { clearAllFilters(); setShowMobileFilters(false); }}
                className="flex-1 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg text-xs font-semibold"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg text-xs font-semibold"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
