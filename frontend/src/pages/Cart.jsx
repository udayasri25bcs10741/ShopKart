import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const Cart = () => {
  const {
    cart,
    loading,
    error,
    subtotal,
    cartCount,
    updateQuantity,
    removeFromCart,
    fetchCart,
    itemLoadingMap,
  } = useCart();

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  if (loading && cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading your shopping cart...</p>
      </div>
    );
  }

  if (error && cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to load cart</h2>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <button
          onClick={fetchCart}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your cart is empty</h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Looks like you haven't added anything to your cart yet. Discover items you'll love!
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm active:scale-95"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            You have {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <Link
          to="/products"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Cart Item Rows */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const product = item.product;
            if (!product) return null;

            const isItemLoading = !!itemLoadingMap[product._id];
            const itemTotal = product.price * item.quantity;

            const formattedPrice = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(product.price);

            const formattedTotal = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(itemTotal);

            return (
              <div
                key={product._id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative transition-all"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <Link to={`/products/${product._id}`} className="shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-100 border border-slate-100"
                    />
                  </Link>

                  <div className="min-w-0 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate hover:text-indigo-600 transition">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 font-medium">
                      Unit Price: {formattedPrice}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      In Stock: {product.stock}
                    </p>
                  </div>
                </div>

                {/* Right: Quantity Controls & Subtotal */}
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      disabled={isItemLoading || item.quantity <= 1}
                      onClick={() => updateQuantity(product._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-black text-slate-900 bg-white py-1.5">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isItemLoading || item.quantity >= product.stock}
                      onClick={() => updateQuantity(product._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Row Total */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      {formattedTotal}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    disabled={isItemLoading}
                    onClick={() => removeFromCart(product._id)}
                    title="Remove item"
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  >
                    {isItemLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Total Units</span>
              <span className="font-bold text-slate-900">{cartCount}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Delivery</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Applicable Taxes</span>
              <span className="text-xs text-slate-400">Included</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-base font-bold text-slate-900">Subtotal</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formattedSubtotal}
              </span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition active:scale-[0.99] text-center"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Guarantee Notes */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Razorpay Test Mode Secured Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Free doorstep shipping on all orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
