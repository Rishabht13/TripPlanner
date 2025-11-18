import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adsAPI, notificationsAPI } from '../utils/api';

function AdminDashboard() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState({ category: 'hotels', title: '', location: '', price: '', imageUrl: '', discountPercent: '', totalSlots: '', description: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const data = useMemo(() => ({ hotels: [], trips: [], transport: [] }), []);
  const [hotels, setHotels] = useState([]);
  const [trips, setTrips] = useState([]);
  const [transport, setTransport] = useState([]);
  useEffect(() => {
    if (authLoading || !user) return;
    Promise.all([
      adsAPI.getAll('hotels'), adsAPI.getAll('trips'), adsAPI.getAll('transport')
    ]).then(([h, t, m]) => { setHotels(h.data); setTrips(t.data); setTransport(m.data); });
  }, [version, authLoading, user]);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (authLoading || !user || !isAdmin) return;
    notificationsAPI.getAll().then(res => setNotifications(res.data)).catch(() => {});
  }, [version, isAdmin, authLoading, user]);

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-600">You need admin rights to view this page.</p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const price = Number(form.price);
    const discountPercent = Number(form.discountPercent || 0);
    if (!form.title || !form.location || !price) {
      setSubmitError('Please fill Title, Location and Price');
      return;
    }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('category', form.category);
      fd.append('title', form.title);
      fd.append('location', form.location);
      fd.append('price', String(price));
      fd.append('discountPercent', String(discountPercent));
      if (form.imageUrl) fd.append('imageUrl', form.imageUrl);
      if (form.totalSlots) fd.append('totalSlots', form.totalSlots);
      if (form.description) fd.append('description', form.description);
      if (file) fd.append('image', file);
      await adsAPI.create(fd);
      setForm({ category: 'hotels', title: '', location: '', price: '', imageUrl: '', discountPercent: '', totalSlots: '', description: '' });
      setFile(null);
      setVersion(v => v + 1);
    } catch (err) {
      console.error('Post ad failed', err);
      setSubmitError(err.response?.data?.message || 'Failed to post ad');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = (category, id) => {
    adsAPI.delete(id).then(() => setVersion(v => v + 1));
  };

  const sections = [
    { key: 'hotels', title: 'Hotels', items: hotels },
    { key: 'trips', title: 'Trips', items: trips },
    { key: 'transport', title: 'Transport', items: transport },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Ads Dashboard</h1>
        <p className="mt-2 text-gray-600">Post and manage marketplace ads</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 mb-2 grid grid-cols-1 md:grid-cols-9 gap-4">
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded px-3 py-2">
          <option value="hotels">Hotels</option>
          <option value="trips">Trips</option>
          <option value="transport">Transport</option>
        </select>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="border rounded px-3 py-2" />
        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="border rounded px-3 py-2" />
        <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price" className="border rounded px-3 py-2" type="number" min="0" />
        <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL (optional)" className="border rounded px-3 py-2" />
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="border rounded px-3 py-2" />
        <input value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} placeholder="Discount %" className="border rounded px-3 py-2" type="number" min="0" max="100" />
        <input value={form.totalSlots} onChange={e => setForm({ ...form, totalSlots: e.target.value })} placeholder="Vacancies" className="border rounded px-3 py-2" type="number" min="1" />
        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="border rounded px-3 py-2" />
        <button type="submit" disabled={submitting} className="bg-blue-600 disabled:opacity-60 text-white rounded px-4 py-2">{submitting ? 'Posting...' : 'Post Ad'}</button>
      </form>
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{submitError}</div>
      )}

      {isAdmin && notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <ul className="space-y-3">
            {notifications.map(note => (
              <li key={note._id} className={`p-3 border rounded ${note.isRead ? 'bg-gray-50' : 'bg-green-50 border-green-200'}`}>
                <div className="font-semibold text-gray-800">{note.message}</div>
                <div className="text-xs text-gray-500">
                  Ad: {note.ad?.title || 'Listing'}, Payment Ref: {note.order?.paymentReference}
                </div>
                <div className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sections.map(sec => (
        <div key={sec.key} className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{sec.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(sec.items || []).map(ad => (
              <div key={ad._id || ad.id} className="bg-white rounded-lg shadow overflow-hidden">
                <img src={ad.imageUrl || ad.thumbnail} alt={ad.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{ad.title}</h3>
                  <div className="text-gray-600 text-sm">{ad.location}</div>
                  <div className="text-xs text-gray-500 mt-1">Vacancies: {ad.availableSlots}/{ad.totalSlots || ad.availableSlots}</div>
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
                  <div className="mt-3 flex justify-end">
                    <button onClick={() => remove(sec.key, ad._id || ad.id)} className="text-red-600 hover:underline text-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;


