import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Truck,
  ShieldCheck,
  Calendar,
  Loader2,
} from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/${id}`);
          setOrder(res.data.order);
        } catch (err) {
          console.error('Fetch order success error:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading order confirmation...</p>
      </div>
    );
  }

  const formattedTotal = order?.totalAmount
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(order.totalAmount)
    : '—';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-8 sm:p-12 text-center">
        {/* Success Icon Animation */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full">
          Payment Confirmed
        </span>

        <h1 className="mt-4 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Thank you for shopping with ShopKart. Your order has been placed and is currently being prepared for dispatch.
        </p>

        {/* Order Meta Box */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Order ID</p>
            <p className="text-xs font-mono font-bold text-indigo-600 truncate mt-1">
              #{id?.slice(-8).toUpperCase()}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Date</p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {new Date(order?.createdAt || Date.now()).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Amount</p>
            <p className="text-xs font-bold text-slate-900 mt-1">{formattedTotal}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
              {order?.status || 'PLACED'}
            </span>
          </div>
        </div>

        {/* Ordered Snapshot Items Preview */}
        {order?.items && order.items.length > 0 && (
          <div className="mt-8 text-left border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Items in this Order
            </h3>
            <div className="space-y-3 divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action CTAs */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders</span>
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition active:scale-95"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
