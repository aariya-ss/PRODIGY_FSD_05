import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Heart, Star, Sparkles } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';

// Local mock products in case backend is offline on startup
const MOCK_FEATURED = [
  {
    id: '1',
    name: 'Classic Blue Denim Jacket',
    description: 'A timeless classic denim jacket crafted from premium blue cotton.',
    price: 89.99,
    category: 'Apparel',
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: '2',
    name: 'Premium Wireless Headphones',
    description: 'Immerse yourself in rich, high-fidelity sound. Features active noise cancellation (ANC).',
    price: 199.99,
    category: 'Electronics',
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: '4',
    name: 'Stainless Steel Water Bottle',
    description: 'Double-walled vacuum insulated water bottle that keeps your drinks ice cold.',
    price: 24.99,
    category: 'Accessories',
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    featured: true
  }
];

export default function Landing() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await api.get('/products', {
          params: { featured: true, size: 4 }
        });
        setFeaturedProducts(response.data.items);
      } catch (err) {
        console.warn('Failed to load featured products from backend. Using mocks.', err);
        setFeaturedProducts(MOCK_FEATURED);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Electronics', count: '12+ Items', icon: '💻', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=300&auto=format&fit=crop&q=80' },
    { name: 'Apparel', count: '45+ Items', icon: '👕', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80' },
    { name: 'Accessories', count: '18+ Items', icon: '👜', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80' },
    { name: 'Furniture', count: '8+ Items', icon: '🪑', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      
      {/* 1. Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl py-20 px-8 md:px-16 flex flex-col md:flex-row items-center gap-12">
        {/* Dynamic Abstract Background Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e3a8a_0%,transparent_60%)] opacity-80" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-primary-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Text Area */}
        <div className="relative z-10 flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/35 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider text-primary-300 uppercase">
            <Sparkles size={12} />
            <span>Premium Local Delivery</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-200">
              Shopping Experience
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-lg">
            Discover a curated collection of local premium products. Fast secure checkouts and reliable local shipping.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Link
              to="/products"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/20 transition-all active:scale-98"
            >
              <span>Shop Collection</span>
              <ArrowRight size={18} />
            </Link>
            <a
              href="#categories"
              className="bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white font-medium py-3 px-8 rounded-xl flex items-center justify-center transition-all"
            >
              Browse Categories
            </a>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="relative z-10 flex-1 w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
            alt="Premium shopping visual"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-6 left-6 right-6 glass-effect rounded-xl p-4 text-slate-800 dark:text-white flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">Featured Style</p>
              <h4 className="text-sm font-bold truncate">Classic Blue Denim Jacket</h4>
            </div>
            <Link to="/products" className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg">
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Perks / Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex gap-4 items-start p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs">
          <div className="p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Free Local Shipping</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Free delivery for all local orders exceeding $100.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs">
          <div className="p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Supabase Guarded</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verified offline JWT authentication checks on request.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs">
          <div className="p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl">
            <RotateCcw size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Easy Returns</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">30-day hassle-free returns policy on all products.</p>
          </div>
        </div>
      </section>

      {/* 3. Categories Grid */}
      <section id="categories" className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Browse Categories</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Find products customized to your exact needs.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-xs hover:border-primary-500/50 hover:shadow-md transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-xl mb-1 block">{cat.icon}</span>
                <h3 className="font-bold text-lg">{cat.name}</h3>
                <p className="text-xs text-slate-300 font-medium">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Products Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Featured Products</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">A selection of popular and high-demand products.</p>
          </div>
          <Link to="/products" className="text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1 hover:underline">
            <span>View All Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
