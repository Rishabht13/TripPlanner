import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await cartAPI.get();
      setCart(res.data);
      setError('');
    } catch (e) {
      console.error('Cart load error', e);
      const msg = e?.response?.data?.message || e?.message || 'Failed to load cart';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }
    load();
  }, [authLoading, user]);

  const total = cart.items?.reduce((sum, it) => sum + it.discountedPrice * it.quantity, 0) || 0;

  const updateQty = async (adId, quantity) => {
    try {
      // Ensure adId is a string, not an object
      const adIdStr = String(adId?._id || adId || '');
      if (!adIdStr || adIdStr === 'undefined' || adIdStr === '[object Object]') {
        setError('Invalid item ID');
        return;
      }
      await cartAPI.updateItem(adIdStr, quantity);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to update quantity');
    }
  };
  const removeItem = async (adId) => {
    try {
      // Ensure adId is a string, not an object
      const adIdStr = String(adId?._id || adId || '');
      if (!adIdStr || adIdStr === 'undefined' || adIdStr === '[object Object]') {
        setError('Invalid item ID');
        return;
      }
      await cartAPI.removeItem(adIdStr);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to remove item');
    }
  };
  const clear = async () => {
    await cartAPI.clear();
    load();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {cart.items?.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-gray-600">Your cart is empty.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cart.items.map(it => {
            // Get adId as string - handle both object and string formats
            const adId = String(it.ad?._id || it.ad || '');
            return (
            <div key={adId} className="bg-white rounded shadow p-4 flex gap-4 items-center">
              <img src={it.imageUrl || 'https://via.placeholder.com/112x80'} alt={it.title} className="w-28 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-semibold">{it.title}</div>
                <div className="text-sm text-gray-600 capitalize">{it.category}</div>
                <div className="mt-1 text-blue-600 font-semibold">₹{it.discountedPrice} <span className="text-xs text-gray-400 line-through ml-2">₹{it.price}</span></div>
                <div className="text-xs text-gray-500 mt-1">Vacancies left: {it.availableSlots ?? 'N/A'}</div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateQty(adId, Math.max(1, (it.quantity || 1) - 1))} 
                  className="px-3 py-1 border rounded hover:bg-gray-50 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={it.quantity <= 1}
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-lg">{it.quantity}</span>
                <button 
                  onClick={() => {
                    const newQty = (it.quantity || 1) + 1;
                    if (it.availableSlots && newQty > it.availableSlots) {
                      alert(`Only ${it.availableSlots} slot(s) available`);
                      return;
                    }
                    updateQty(adId, newQty);
                  }} 
                  className="px-3 py-1 border rounded hover:bg-gray-50 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={it.availableSlots !== undefined && (it.quantity || 1) >= it.availableSlots}
                >
                  +
                </button>
              </div>
              <button onClick={() => removeItem(adId)} className="text-red-600 hover:underline text-sm">Remove</button>
            </div>
            );
          })}
          <div className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-lg font-semibold">Total: ₹{total}</div>
            <div className="flex gap-3">
              <button onClick={clear} className="px-4 py-2 border rounded">Clear Cart</button>
              <Link to="/checkout" className="px-4 py-2 bg-green-600 text-white rounded text-center">Proceed to Checkout</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;


