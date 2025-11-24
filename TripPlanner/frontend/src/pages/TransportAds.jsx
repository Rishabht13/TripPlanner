import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adsAPI, cartAPI } from '../utils/api';

function TransportAds() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('priceAsc');
  const [itemsVersion, setItemsVersion] = useState(0);
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (authLoading) return;
    adsAPI.getAll('transport').then(res => setItems(res.data)).catch(() => {});
  }, [itemsVersion, authLoading]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? items.filter(a => `${a.title} ${a.location}`.toLowerCase().includes(q)) : items;
    return [...base].sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'ratingDesc') return b.rating - a.rating;
      return 0;
    });
  }, [items, query, sortBy]);

  const [form, setForm] = useState({ title: '', location: '', price: '', imageUrl: '', discountPercent: '', totalSlots: '', description: '' });
  const [file, setFile] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    const price = Number(form.price);
    const discountPercent = Number(form.discountPercent || 0);
    if (!form.title || !form.location || !price) return;
    const totalSlots = Number(form.totalSlots || 0);
    const fd = new FormData();
    fd.append('category', 'transport');
    fd.append('title', form.title);
    fd.append('location', form.location);
    fd.append('price', String(price));
    fd.append('discountPercent', String(discountPercent));
    if (totalSlots > 0) fd.append('totalSlots', String(totalSlots));
    if (form.imageUrl) fd.append('imageUrl', form.imageUrl);
    if (form.description) fd.append('description', form.description);
    if (file) fd.append('image', file);
    await adsAPI.create(fd);
    setForm({ title: '', location: '', price: '', imageUrl: '', discountPercent: '', totalSlots: '', description: '' });
    setFile(null);
    setItemsVersion(v => v + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transport Ads</h1>
          <p className="mt-1 text-gray-600">Browse vehicles and rentals</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search transport..." className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex gap-4">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-3 py-2">
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="ratingDesc">Rating</option>
          </select>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-8 gap-4">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="border rounded px-3 py-2" />
          <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="border rounded px-3 py-2" />
          <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price" className="border rounded px-3 py-2" type="number" min="0" />
          <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL (optional)" className="border rounded px-3 py-2" />
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="border rounded px-3 py-2" />
          <input value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} placeholder="Discount %" className="border rounded px-3 py-2" type="number" min="0" max="100" />
          <input value={form.totalSlots} onChange={e => setForm({ ...form, totalSlots: e.target.value })} placeholder="Vacancies" className="border rounded px-3 py-2" type="number" min="1" />
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="border rounded px-3 py-2" />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Post Ad</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(ad => (
          <div key={ad._id || ad.id} className="bg-white rounded-lg shadow overflow-hidden">
            <img src={ad.imageUrl || ad.thumbnail} alt={ad.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{ad.title}</h3>
              <div className="text-gray-600 text-sm">{ad.location}</div>
              <div className="text-xs text-gray-500 mt-1">Vacancies left: {ad.availableSlots}</div>
              {ad.description && <div className="text-xs text-gray-500 mt-1">{ad.description}</div>}
              <div className="flex items-center justify-between mt-2">
                <div className="text-blue-600 font-semibold">
                  {ad.discountPercent > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-400">₹{ad.price}</span>
                      <span>₹{ad.discountedPrice}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{ad.discountPercent}% off</span>
                    </div>
                  ) : (
                    <>₹{ad.price}</>
                  )}
                </div>
                <div className="text-yellow-600">★ {ad.rating}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  disabled={ad.availableSlots === 0}
                  onClick={async () => { try { await cartAPI.addItem(ad._id || ad.id); alert('Added to cart'); } catch (e) { alert(e?.response?.data?.message || 'Failed to add'); } }}
                  className={`px-3 py-1 text-sm border rounded ${ad.availableSlots === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {ad.availableSlots === 0 ? 'Sold Out' : 'Add to Cart'}
                </button>
                <a href="/cart" className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Buy Now</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransportAds;


