import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Heart, Check, Plus, Minus, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { ProductDetailSkeleton } from '../components/Skeleton';
import ProductCard from '../components/ProductCard';

// Local mock products database for fallback lookup
const ALL_MOCK_PRODUCTS = [
  { id: '1', name: 'Classic Blue Denim Jacket', description: 'A timeless classic denim jacket crafted from premium blue cotton. Featuring dual chest pockets, adjustable button waist, and a comfortable, relaxed fit.', price: 89.99, category: 'Apparel', stock: 25, image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', featured: true },
  { id: '2', name: 'Premium Wireless Headphones', description: 'Immerse yourself in rich, high-fidelity sound. Features active noise cancellation (ANC), 40-hour battery life, and comfortable memory foam ear cups.', price: 199.99, category: 'Electronics', stock: 15, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', featured: true },
  { id: '3', name: 'Ergonomic Office Chair', description: 'Upgrade your work-from-home setup with our premium ergonomic mesh office chair. Offers lumbar support, adjustable 3D armrests, and dynamic tilt functionality.', price: 249.50, category: 'Furniture', stock: 10, image_url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80', featured: false },
  { id: '4', name: 'Stainless Steel Water Bottle', description: 'Double-walled vacuum insulated water bottle that keeps your drinks ice cold for 24 hours or piping hot for 12 hours. leak-proof cap.', price: 24.99, category: 'Accessories', stock: 50, image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', featured: true },
  { id: '5', name: 'Minimalist Leather Wallet', description: 'Sleek RFID-blocking card holder wallet crafted from genuine full-grain leather. Comfortably fits up to 8 cards and cash.', price: 39.99, category: 'Accessories', stock: 35, image_url: 'https://images.unsplash.com/photo-1627124118974-1d80dd4c9447?w=600&auto=format&fit=crop&q=80', featured: false },
  { id: '6', name: 'Mechanical Gaming Keyboard', description: 'Tactile blue switches, customizable RGB backlighting, full anti-ghosting keys, and a premium aluminum frame for serious gamers.', price: 79.99, category: 'Electronics', stock: 20, image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80', featured: false }
];

export default function ProductDetail() {
  const { id } = useParams();
  const addToCart = useStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadProductDetail() {
      setLoading(true);
      setErrorMsg('');
      try {
        const prodRes = await api.get(`/products/${id}`);
        setProduct(prodRes.data);

        // Fetch related products (same category)
        const relRes = await api.get('/products', {
          params: { category: prodRes.data.category, size: 4 }
        });
        // Filter out current product
        setRelated(relRes.data.items.filter((p) => p.id !== id));
      } catch (err) {
        console.warn('Failed to fetch from backend API. Using local mock databases.', err);
        // Fallback mock lookup
        const found = ALL_MOCK_PRODUCTS.find((p) => p.id === id);
        if (found) {
          setProduct(found);
          const sameCategory = ALL_MOCK_PRODUCTS.filter(
            (p) => p.category === found.category && p.id !== id
          );
          setRelated(sameCategory.slice(0, 4));
        } else {
          setErrorMsg('Product not found.');
        }
      } finally {
        setLoading(false);
      }
    }
    setQuantity(1);
    loadProductDetail();
  }, [id]);

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty < 1) return;
    if (newQty > product.stock) {
      setErrorMsg(`Cannot select more than available stock (${product.stock} items)`);
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setQuantity(newQty);
  };

  const handleAddToCart = () => {
    try {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 3500);
    }
  };

  if (loading) return <ProductDetailSkeleton />;
  if (errorMsg && !product) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center my-12">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-bold">Error Loading Product</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{errorMsg}</p>
        <Link to="/products" className="inline-block mt-6 text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="space-y-16">
      
      {/* Back link */}
      <div>
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      {/* Main product presentation */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Left Image box */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="text-white font-bold tracking-wide uppercase px-4 py-2 border-2 border-white rounded-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Right Info Box */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white pt-2">
              ${Number(product.price).toFixed(2)}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-800" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Overview</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              {product.description || 'This premium product is crafted to provide premium quality and reliable local utility. Order today for immediate delivery.'}
            </p>
          </div>

          {/* Stock state */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Availability:</span>
            {isOutOfStock ? (
              <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle size={14} /> Out of stock
              </span>
            ) : isLowStock ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Low Stock (Only {product.stock} items remaining)
              </span>
            ) : (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                In Stock ({product.stock} items available)
              </span>
            )}
          </div>

          {/* Cart Quantity Selector and Actions */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    className="p-3 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    className="p-3 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-900/50 animate-shake">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`flex-grow py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg hover:shadow-primary-500/20 active:scale-98'
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={18} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">You May Also Like</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Recommended items from the same category.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
