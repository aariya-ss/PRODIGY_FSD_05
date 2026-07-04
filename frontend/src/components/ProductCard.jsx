import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ProductCard({ product }) {
  const addToCart = useStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to detail if clicked inside card
    e.stopPropagation();
    
    try {
      addToCart(product, 1);
      setAdded(true);
      setErrorMsg('');
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-300 flex flex-col h-full">
      {/* Featured Badge */}
      {product.featured && (
        <span className="absolute top-3 left-3 z-10 bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
          Featured
        </span>
      )}

      {/* Product Image Link */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-white font-bold tracking-wide uppercase px-4 py-2 border-2 border-white rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Body Details */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category */}
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
          {product.category}
        </span>
        
        {/* Name */}
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1 mb-2 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Description Snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
          {product.description || 'No description available for this premium local product.'}
        </p>

        {/* Stock Level and Price */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {/* Stock status indicator */}
            {isOutOfStock ? (
              <span className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} /> Out of stock
              </span>
            ) : isLowStock ? (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                Only {product.stock} left
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                In Stock ({product.stock})
              </span>
            )}

            {/* Price */}
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Action button or error alerts */}
          {errorMsg ? (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900/50 text-center animate-shake">
              {errorMsg}
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg hover:shadow-primary-500/20 active:scale-98'
              }`}
            >
              {added ? (
                <>
                  <Check size={16} /> Added!
                </>
              ) : (
                <>
                  <ShoppingCart size={16} /> Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
