import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { 
  ShoppingBag, 
  ChevronRight, 
  Leaf, 
  Flame, 
  Truck, 
  Utensils, 
  Milk, 
  Croissant 
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { addToCart, formatRupees } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await api.get('/products?featured=true');
        setFeaturedProducts(res.data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const categories = [
    {
      name: 'Fruits & Vegetables',
      description: 'Organic & Farm Fresh',
      icon: Leaf,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450',
      border: 'hover:border-emerald-500',
      query: 'Fruits & Vegetables'
    },
    {
      name: 'Dairy',
      description: 'Milk, Butter, Cheese & Eggs',
      icon: Milk,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450',
      border: 'hover:border-blue-500',
      query: 'Dairy'
    },
    {
      name: 'Bakery',
      description: 'Artisanal Breads & Croissants',
      icon: Croissant,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-450',
      border: 'hover:border-amber-500',
      query: 'Bakery'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white py-20 px-8 sm:px-16 mt-6 shadow-xl shadow-slate-250 dark:shadow-none">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-indigo-400 text-xs font-semibold">
            <Flame className="h-3.5 w-3.5" />
            Fastest Local Delivery in Town
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Freshness from <br />
            <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Local Farms
            </span> to Your Doorstep.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg">
            SmartBuy connects you directly with the best local organic farms, dairies, and bakeries near you. No middleman. Pure quality.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/products"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 font-semibold text-white shadow-md shadow-indigo-500/10 transition-all duration-200"
            >
              Shop All Products
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
            <a
              href="#categories"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-700 hover:border-slate-500 hover:bg-slate-850 px-6 font-semibold text-slate-350 transition-colors"
            >
              Browse Categories
            </a>
          </div>
        </div>
      </section>

      {/* Services badging */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-950 dark:text-white">Free Local Delivery</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">For all orders above ₹500</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-450">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-950 dark:text-white">100% Organic Produce</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pure, unadulterated fruits & veg</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-450">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-950 dark:text-white">Baked Daily</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fresh croissants & sourdough bread</p>
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section id="categories" className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose from our curated local categories of high-quality items.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div 
                key={idx}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.query)}`)}
                className={`group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 ${cat.border}`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 transition-transform duration-200 group-hover:scale-108 ${cat.color}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-950 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                  {cat.description}
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  Shop Now
                  <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Items */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Featured Local Picks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top trending organic and farm-fresh items in your area.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline"
          >
            View All Products
            <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => {
              const discount = Math.round(
                ((prod.original_price - prod.price) / prod.original_price) * 100
              );
              
              return (
                <div 
                  key={prod.id}
                  className="group relative flex flex-col p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 hover:shadow-lg transition-all duration-200"
                >
                  {/* Discount Badge */}
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

                  {/* Price Row & Add Button */}
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
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
