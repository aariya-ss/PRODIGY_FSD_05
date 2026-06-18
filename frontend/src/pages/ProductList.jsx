import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { 
  ShoppingBag, 
  SlidersHorizontal, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export default function ProductList() {
  const { addToCart, formatRupees } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search params values
  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Local filter states for sidebar inputs
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  const itemsPerPage = 8;
  const skip = (currentPage - 1) * itemsPerPage;

  useEffect(() => {
    // Sync local filter inputs when URL query params change
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {
          skip,
          limit: itemsPerPage + 1, // Fetch 1 extra to check if a next page exists
          category: currentCategory !== 'All' ? currentCategory : undefined,
          search: currentSearch || undefined,
          sort: currentSort || undefined,
          min_price: currentMinPrice ? parseFloat(currentMinPrice) : undefined,
          max_price: currentMaxPrice ? parseFloat(currentMaxPrice) : undefined,
        };

        const res = await api.get('/products', { params });
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [currentCategory, currentSearch, currentSort, currentMinPrice, currentMaxPrice, currentPage]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    
    // Always reset to page 1 on filter changes
    updated.set('page', '1');

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });

    setSearchParams(updated);
  };

  const handleApplyPriceFilter = (e) => {
    e.preventDefault();
    updateFilters({
      min_price: minPriceInput,
      max_price: maxPriceInput,
    });
  };

  const handleResetFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams(new URLSearchParams());
  };

  const categories = ['All', 'Fruits & Vegetables', 'Dairy', 'Bakery'];
  
  // Pagination helpers
  const hasMore = products.length > itemsPerPage;
  const displayedProducts = hasMore ? products.slice(0, itemsPerPage) : products;

  return (
    <div className="py-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {currentCategory === 'All' ? 'All Local Essentials' : currentCategory}
          </h1>
          {currentSearch && (
            <p className="text-xs text-slate-500 mt-1">
              Search results for: "<span className="font-semibold">{currentSearch}</span>"
            </p>
          )}
        </div>

        {/* Sorting & Filter controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6">
          
          {/* Categories Selector */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilters({ category: cat })}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    currentCategory === cat 
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Price Range
            </h3>
            <form onSubmit={handleApplyPriceFilter} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs focus:border-indigo-500 focus:bg-white outline-none dark:text-white"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs focus:border-indigo-500 focus:bg-white outline-none dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full h-9 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 text-indigo-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                Apply Price
              </button>
            </form>
          </div>

          {/* Clear Filters */}
          <button
            onClick={handleResetFilters}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-700 transition-all cursor-pointer"
          >
            Clear All Filters
          </button>

        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                  <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-20 p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                No local products match your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((prod) => {
                  const discount = Math.round(
                    ((prod.original_price - prod.price) / prod.original_price) * 100
                  );
                  
                  return (
                    <div 
                      key={prod.id}
                      className="group relative flex flex-col p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 hover:shadow-lg transition-all duration-200"
                    >
                      {discount > 0 && (
                        <span className="absolute top-6 left-6 z-10 inline-flex items-center rounded-lg bg-emerald-500 text-[10px] font-bold text-white px-2 py-0.5 shadow-sm">
                          {discount}% OFF
                        </span>
                      )}

                      {/* Product Image */}
                      <Link to={`/products/${prod.id}`} className="aspect-square w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950 mb-3">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>

                      {/* Category */}
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {prod.category}
                      </span>

                      {/* Name */}
                      <Link 
                        to={`/products/${prod.id}`}
                        className="font-bold text-sm text-slate-900 dark:text-white mt-1 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1"
                      >
                        {prod.name}
                      </Link>

                      {/* Stock Alert */}
                      {prod.stock <= 5 && prod.stock > 0 && (
                        <span className="text-[10px] text-red-500 font-semibold mt-1">
                          Only {prod.stock} left in stock!
                        </span>
                      )}

                      {/* Pricing and Button */}
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {formatRupees(prod.price)}
                          </span>
                          {prod.original_price > prod.price && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatRupees(prod.original_price)}
                            </span>
                          )}
                        </div>

                        {prod.stock > 0 ? (
                          <button
                            onClick={() => addToCart(prod, 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95 shadow-sm transition-all cursor-pointer"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-center gap-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <button
                  onClick={() => updateFilters({ page: currentPage - 1 })}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 disabled:opacity-50 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-xs font-bold text-slate-650 dark:text-slate-400">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => updateFilters({ page: currentPage + 1 })}
                  disabled={!hasMore}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 disabled:opacity-50 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-80 h-full p-6 bg-white dark:bg-slate-900 shadow-xl overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-3">
                <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        updateFilters({ category: cat });
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl ${
                        currentCategory === cat 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Price Range</h3>
                <form onSubmit={(e) => { handleApplyPriceFilter(e); setShowMobileFilters(false); }} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-white"
                    />
                    <span className="text-slate-400 text-xs">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-9 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 text-indigo-600 text-xs font-semibold"
                  >
                    Apply Price
                  </button>
                </form>
              </div>
            </div>

            <button
              onClick={() => { handleResetFilters(); setShowMobileFilters(false); }}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-50 mt-6"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
