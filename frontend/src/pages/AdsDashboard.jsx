import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { cartAPI } from "../utils/api";
import { adsAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function AdsDashboard() {
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("priceAsc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ads, setAds] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    const fetchAll = async () => {
      try {
        const [h, t, m] = await Promise.all([
          adsAPI.getAll("hotels"),
          adsAPI.getAll("trips"),
          adsAPI.getAll("transport"),
        ]);
        const list = [
          ...h.data.map((a) => ({ ...a, category: "hotels" })),
          ...t.data.map((a) => ({ ...a, category: "trips" })),
          ...m.data.map((a) => ({ ...a, category: "transport" })),
        ];
        setAds(list);
      } catch (err) {
        console.error('Failed to load ads', err);
      }
    };
    fetchAll();
  }, [authLoading]);

  const combined = useMemo(() => {
    const pool = ads.filter(
      (a) => categoryFilter === "all" || a.category === categoryFilter
    );
    const q = query.trim().toLowerCase();
    const filtered = q
      ? pool.filter((a) => `${a.title} ${a.location}`.toLowerCase().includes(q))
      : pool;
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "priceAsc") return a.price - b.price;
      if (sortBy === "priceDesc") return b.price - a.price;
      if (sortBy === "ratingDesc") return b.rating - a.rating;
      return 0;
    });
    return sorted.slice(0, 9);
  }, [ads, query, sortBy, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Deals</h1>
        <p className="mt-2 text-gray-600">
          Hotels, trips, and transport offers
        </p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate("/ads/hotels")}
          className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-left"
        >
          <div className="text-2xl mb-2">🏨</div>
          <div className="text-xl font-semibold">Hotels</div>
          <div className="text-gray-600">Find stays and resorts</div>
        </button>
        <button
          onClick={() => navigate("/ads/trips")}
          className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-left"
        >
          <div className="text-2xl mb-2">🧭</div>
          <div className="text-xl font-semibold">Trips</div>
          <div className="text-gray-600">Curated tour packages</div>
        </button>
        <button
          onClick={() => navigate("/ads/transport")}
          className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-left"
        >
          <div className="text-2xl mb-2">🚗</div>
          <div className="text-xl font-semibold">Transport</div>
          <div className="text-gray-600">Cars, bikes, and more</div>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location or title..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All</option>
            <option value="hotels">Hotels</option>
            <option value="trips">Trips</option>
            <option value="transport">Transport</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="ratingDesc">Rating</option>
          </select>
        </div>
      </div>

      {/* Sample ads grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {combined.map((ad) => (
          <div
            key={ad._id || ad.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={ad.imageUrl || ad.thumbnail}
              alt={ad.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {ad.title}
                </h3>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded capitalize">
                  {ad.category}
                </span>
              </div>
              <div className="text-gray-600 text-sm mb-2">{ad.location}</div>
                <div className="text-xs text-gray-500 mb-2">Vacancies left: {ad.availableSlots}</div>
              <div className="flex items-center justify-between">
                <div className="text-blue-600 font-semibold">
                  {ad.discountPercent > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-400">
                        ₹{ad.price}
                      </span>
                      <span>₹{ad.discountedPrice}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        {ad.discountPercent}% off
                      </span>
                    </div>
                  ) : (
                    <>₹{ad.price}</>
                  )}
                </div>
                <div className="text-yellow-600">★ {ad.rating}</div>
              </div>
              <div className="mt-3">
                <Link
                  to={`/ads/${ad.category}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View more in {ad.category}
                </Link>
                <div className="mt-2 flex gap-2">
                  <button
                    disabled={ad.availableSlots === 0}
                    onClick={async () => { try { await cartAPI.addItem(ad._id || ad.id); alert('Added to cart'); } catch (e) { alert(e?.response?.data?.message || 'Failed to add'); } }}
                    className={`px-3 py-1 text-sm border rounded ${ad.availableSlots === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {ad.availableSlots === 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                  <Link to="/cart" className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Buy Now</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdsDashboard;
