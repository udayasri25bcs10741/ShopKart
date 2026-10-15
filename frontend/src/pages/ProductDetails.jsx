import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductDetailsSkeleton } from '../components/Skeleton';
import {
  ChevronLeft,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Package,
  Loader2,
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, itemLoadingMap: cartLoadingMap, cart } = useCart();
  const { toggleWishlist, isInWishlist, itemLoadingMap: wishlistLoadingMap } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [feedbackToast, setFeedbackToast] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        console.error('Fetch product details error:', err);
        const status = err.response?.status;
        if (status === 404) {
          setError('The requested product could not be found.');
        } else if (status === 400) {
          setError('Invalid product identifier format.');
        } else {
          setError('Failed to load product details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    // Add current selected quantity
    for (let i = 0; i < quantity; i++) {
      await addToCart(product._id);
    }
    setFeedbackToast('Added to your cart successfully!');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    const res = await toggleWishlist(product._id);
    if (res.success) {
      setFeedbackToast(res.isAdded ? 'Saved to Wishlist!' : 'Removed from Wishlist');
      setTimeout(() => setFeedbackToast(null), 2500);
    }
  };

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Product Not Available</h2>
        <p className="mt-2 text-sm text-slate-500">{error || 'Product not found.'}</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isWishlisted = isInWishlist(product._id);
  const isCartLoading = !!cartLoadingMap[product._id];
  const isWishlistLoading = !!wishlistLoadingMap[product._id];

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
        <Link to="/home" className="hover:text-slate-700 transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-slate-700 transition">Products</Link>
        <span>/</span>
        <span className="text-slate-800 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main 2-Column Product Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs">
        {/* Left: Large Product Image */}
        <div className="flex flex-col">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 relative group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-slate-200/80">
                {product.category}
              </span>
            </div>

            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500 ring-2 ring-rose-300'
                  : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
              }`}
            >
              {isWishlistLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
              ) : (
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              )}
            </button>
          </div>
        </div>

        {/* Right: Product Meta & Purchase Actions */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-2.5">
                <Package className="w-3.5 h-3.5" />
                <span>ShopKart Verified Item</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price & Stock Display */}
            <div className="flex items-baseline gap-4 pb-6 border-b border-slate-100">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                {formattedPrice}
              </span>

              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-red-700 bg-red-100 border border-red-200">
                  Out of Stock
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200">
                  {product.stock} units available
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector & Purchase CTAs */}
            <div className="pt-4 space-y-4">
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase text-slate-500">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-slate-900 bg-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isOutOfStock || isCartLoading}
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-lg shadow-indigo-600/25 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCartLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adding to Cart...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                  className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm transition-all border cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Save to Wishlist'}</span>
                </button>
              </div>

              {/* Toast Feedback */}
              {feedbackToast && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feedbackToast}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-800">Express Delivery</span>
              <span className="text-[10px] text-slate-400">2-4 Business Days</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-800">100% Authentic</span>
              <span className="text-[10px] text-slate-400">Direct from Brand</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-800">Easy Returns</span>
              <span className="text-[10px] text-slate-400">7-Day Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
