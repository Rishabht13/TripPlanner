import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, checkoutAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await cartAPI.get();
      setCart(res.data);
      if (!res.data.items?.length) {
        setError('Your cart is empty. Add ads before checking out.');
      } else {
        setError('');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }
    loadCart();
  }, [authLoading, user]);

  const total = cart.items?.reduce((sum, it) => sum + it.discountedPrice * it.quantity, 0) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!upiId.trim()) {
      setError('Enter the UPI ID where you will receive the Paytm collect request.');
      return;
    }
    setSubmitting(true);
    try {
      await checkoutAPI.pay({ upiId: upiId.trim() });
      alert('Payment successful! Your booking has been recorded.');
      navigate('/dashboard');
    } catch (e) {
      setError(e?.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading checkout...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600">Complete your payment via UPI to our Paytm account.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {(cart.items || []).map(item => (
            <div key={String(item.ad)} className="bg-white rounded shadow p-4 flex items-start gap-4">
              <img src={item.imageUrl} alt={item.title} className="w-24 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-gray-500 capitalize">{item.category}</div>
                <div className="text-sm text-gray-500 mt-1">{item.quantity} slot(s) · ₹{item.discountedPrice} each</div>
                <div className="text-xs text-gray-400 mt-1">Vacancies left: {item.availableSlots}</div>
              </div>
              <div className="text-right font-semibold">₹{item.discountedPrice * item.quantity}</div>
            </div>
          ))}
          {!cart.items?.length && (
            <div className="bg-white rounded shadow p-6 text-gray-600 text-center">
              Your cart is empty.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Pay with UPI</h2>
          <div className="text-sm text-gray-600">
            Pay to <span className="font-semibold text-gray-900">Paytm UPI: parthsapra@paytm</span>. Enter your UPI ID so we can send a collect request or confirm your transfer.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your UPI ID</label>
            <input
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              placeholder="yourname@paytm"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">Order Summary</p>
            <div className="flex justify-between mt-2">
              <span>Total</span>
              <span className="text-lg font-semibold text-gray-900">₹{total}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || !cart.items?.length}
            className="w-full bg-green-600 text-white rounded py-2 disabled:opacity-60"
          >
            {submitting ? 'Processing...' : 'Pay & Confirm'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;


