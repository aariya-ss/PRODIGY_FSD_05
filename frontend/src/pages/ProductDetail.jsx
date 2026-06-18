import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { ShoppingCart, ShoppingBag, ArrowLeft, Plus, Minus, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, formatRupees } = useStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [bgPosition, setBgPosition] = useState('0% 0%');
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    async function fetchProductAndRelated() {
      setLoading(true);
      try {
        // Fetch current product
        const prodRes = await api.get(`/products/${id}`);
        const currentProd = prodRes.data;
        setProduct(currentProd);
        setQuantity(1);

        // Fetch related products (same category, up to 4 items, excluding current)
        const relRes = await api.get('/products', {
          params: {
            category: currentProd.category,
            limit: 5
          }
        });
        setRelatedProducts(relRes.data.filter(p => p.id !== currentProd.id).slice(0, 4));

      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductAndRelated();
  }, [id]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBgPosition(`${x}% ${y}%`);
  };

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
      setQuantity(prev => Math.min(prev + 1, product.stock));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  if (loading) {
    return (
      <div className="py-12 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl mt-6">
        <p className="text-sm font-semibold text-slate-500">Product not found.</p>
        <Link to="/products" className="mt-4 inline-flex items-center text-xs font-bold text-indigo-650 hover:underline">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const discount = Math.round(
    ((product.original_price - product.price) / product.original_price) * 100
  );

  return (
    <div className="py-6 space-y-16">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Main product columns */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left: Interactive zoom image card */}
        <div className="flex flex-col">
          <div 
            className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-square w-full cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
          >
            {/* Base Image */}
            <img
              src={product.image_url}
              alt={product.name}
              className={`h-full w-full object-cover object-center transition-opacity duration-200 ${
                showZoom ? 'opacity-0' : 'opacity-100'
              }`}
            />
            
            {/* Zoom Screen Overlay */}
            {showZoom && (
              <div 
                className="absolute inset-0 bg-no-repeat pointer-events-none"
                style={{
                  backgroundImage: `url(${product.image_url})`,
                  backgroundPosition: bgPosition,
                  backgroundSize: '250%',
                }}
              />
            )}

            {/* Discount tag */}
            {discount > 0 && (
              <span className="absolute top-4 left-4 z-10 inline-flex items-center rounded-lg bg-emerald-500 text-xs font-bold text-white px-2.5 py-1 shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-455 text-center mt-2.5">
            Hover over the image to magnify details.
          </span>
        </div>

        {/* Right: Info and selectors */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category */}
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Stock status badge */}
            <div className="flex items-center gap-2">
              {product.stock > 5 ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 px-2.5 py-1 text-xs font-semibold border border-emerald-100/50 dark:border-emerald-950">
                  In Stock ({product.stock} units)
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450 px-2.5 py-1 text-xs font-semibold border border-amber-100/50 dark:border-amber-950">
                  Only {product.stock} items left in stock!
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Pricing Card */}
            <div className="flex items-baseline gap-3 border-y border-slate-100 dark:border-slate-850 py-4 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatRupees(product.price)}
              </span>
              {product.original_price > product.price && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {formatRupees(product.original_price)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Save {formatRupees(product.original_price - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-350">
                {product.description || 'No detailed description available for this local item.'}
              </p>
            </div>

          </div>

          {/* Add-to-cart operations */}
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-850">
            
            {product.stock > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* Quantity picker */}
                <div className="flex items-center border border-slate-250 dark:border-slate-800 rounded-xl h-11 bg-white dark:bg-slate-950 overflow-hidden shrink-0">
                  <button
                    onClick={() => handleQuantityChange('dec')}
                    className="px-3 hover:bg-slate-50 dark:hover:bg-slate-900 h-full flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-4 w-4 text-slate-500" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange('inc')}
                    className="px-3 hover:bg-slate-50 dark:hover:bg-slate-900 h-full flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-4 w-4 text-slate-500" />
                  </button>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md hover:shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  Add to Cart ({formatRupees(product.price * quantity)})
                </button>

              </div>
            )}

            {/* Delivery/Warranty info */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Quality Inspected</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Freshness Guaranteed</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Related items carousel */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Related Items in this Category
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => {
              const disc = Math.round(
                ((prod.original_price - prod.price) / prod.original_price) * 100
              );
              
              return (
                <div 
                  key={prod.id}
                  className="group relative flex flex-col p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 hover:shadow-lg transition-all duration-200"
                >
                  {disc > 0 && (
                    <span className="absolute top-6 left-6 z-10 inline-flex items-center rounded-lg bg-emerald-500 text-[10px] font-bold text-white px-2 py-0.5 shadow-sm">
                      {disc}% OFF
                    </span>
                  )}
                  
                  {/* Image */}
                  <Link to={`/products/${prod.id}`} className="aspect-square w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950 mb-3">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Name */}
                  <Link 
                    to={`/products/${prod.id}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-650 mt-1 block truncate"
                  >
                    {prod.name}
                  </Link>

                  {/* Price Row */}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatRupees(prod.price)}
                      </span>
                    </div>

                    {prod.stock > 0 ? (
                      <button
                        onClick={() => addToCart(prod, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-55 hover:bg-indigo-100 text-indigo-600 hover:scale-105 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        Out
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
