import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductGridSkeleton } from '../components/Skeleton';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';

const Wishlist = () => {
  const { wishlist, loading, error, removeFromWishlist, fetchWishlist, itemLoadingMap: wishlistLoadingMap } = useWishlist();
  const { addToCart, itemLoadingMap: cartLoadingMap } = useCart();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-slate-500">Loading your saved products...</p>
        </div>
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to load wishlist</h2>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <button
          onClick={fetchWishlist}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your wishlist is empty</h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Save products you love and find them here anytime when you're ready to purchase.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm active:scale-95"
        >
          <span>Browse Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saved Favorites</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const isOutOfStock = product.stock <= 0;
          const isRemoving = !!wishlistLoadingMap[product._id];
          const isAddingToCart = !!cartLoadingMap[product._id];

          const formattedPrice = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(product.price);

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 bg-white/95 backdrop-blur-md rounded-md shadow-xs border border-slate-200/60">
                    {product.category}
                  </span>
                </div>

                {/* Remove from wishlist top right button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product._id)}
                  disabled={isRemoving}
                  title="Remove from wishlist"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition shadow-xs cursor-pointer"
                >
                  {isRemoving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1 hover:text-indigo-600 transition">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      {formattedPrice}
                    </span>

                    {isOutOfStock ? (
                      <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                        Out of stock
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {product.stock} available
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="inline-flex items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition text-center"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    disabled={isOutOfStock || isAddingToCart}
                    onClick={() => addToCart(product._id)}
                    className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-3 h-3" />
                    )}
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
