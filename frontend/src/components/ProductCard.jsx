import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  ShoppingCart,
  ArrowRight,
  Loader2,
  Check,
} from 'lucide-react';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart, itemLoadingMap: cartLoadingMap, cart } = useCart();
  const { toggleWishlist, isInWishlist, itemLoadingMap: wishlistLoadingMap } = useWishlist();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isWishlisted = isInWishlist(product._id);
  const isAddingToCart = !!cartLoadingMap[product._id];
  const isTogglingWishlist = !!wishlistLoadingMap[product._id];

  // Check if item is already in cart to display "Add Another" or "In Cart" badge
  const existingCartItem = cart.find((i) => (i.product?._id || i.product) === product._id);
  const inCartQuantity = existingCartItem?.quantity || 0;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product._id);
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product._id);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Category Tag */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 bg-white/95 backdrop-blur-md rounded-lg shadow-xs border border-slate-200/60">
            {product.category}
          </span>
        </div>

        {/* Wishlist Heart Action Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={isTogglingWishlist}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 ring-2 ring-rose-200'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white backdrop-blur-md'
          }`}
        >
          {isTogglingWishlist ? (
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
          ) : (
            <Heart
              className={`w-4 h-4 transition-transform duration-150 active:scale-125 ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          )}
        </button>

        {/* Stock Badge Overlay */}
        <div className="absolute bottom-2.5 left-3">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-100/95 backdrop-blur-md rounded-md border border-red-200 shadow-xs">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-100/95 backdrop-blur-md rounded-md border border-amber-200 shadow-xs">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      </div>

      {/* Content Details */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <Link to={`/products/${product._id}`}>
            <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price</span>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                {formattedPrice}
              </span>
            </div>

            {inCartQuantity > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <Check className="w-3 h-3" />
                <span>{inCartQuantity} in cart</span>
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${product._id}`}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <button
              type="button"
              disabled={isOutOfStock || isAddingToCart}
              onClick={handleAddToCartClick}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                inCartQuantity > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{inCartQuantity > 0 ? '+ Add More' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
