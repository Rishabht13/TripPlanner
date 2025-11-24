const STORAGE_KEY = 'adsData';

const defaultData = {
  hotels: [
    { id: 'h1', title: 'Seaside Resort', location: 'Goa, India', price: 120, rating: 4.5, thumbnail: 'https://picsum.photos/seed/h1/400/240' },
    { id: 'h2', title: 'Mountain View Lodge', location: 'Manali, India', price: 90, rating: 4.2, thumbnail: 'https://picsum.photos/seed/h2/400/240' },
  ],
  trips: [
    { id: 't1', title: 'Kerala Backwaters Tour', location: 'Alleppey, India', price: 300, rating: 4.7, thumbnail: 'https://picsum.photos/seed/t1/400/240' },
    { id: 't2', title: 'Golden Triangle', location: 'Delhi-Agra-Jaipur', price: 450, rating: 4.6, thumbnail: 'https://picsum.photos/seed/t2/400/240' },
  ],
  transport: [
    { id: 'm1', title: 'SUV Rental', location: 'Bengaluru, India', price: 50, rating: 4.1, thumbnail: 'https://picsum.photos/seed/m1/400/240' },
    { id: 'm2', title: 'Scooter Hire', location: 'Goa, India', price: 12, rating: 4.0, thumbnail: 'https://picsum.photos/seed/m2/400/240' },
  ],
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw);
    return { hotels: [], trips: [], transport: [], ...parsed };
  } catch (_) {
    return { ...defaultData };
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAllAds() {
  return load();
}

export function getAdsByCategory(category) {
  const data = load();
  return data[category] || [];
}

export function addAd(category, ad) {
  const data = load();
  const idPrefix = category.charAt(0);
  const newAd = { id: `${idPrefix}${Date.now()}`, rating: 4.0, thumbnail: `https://picsum.photos/seed/${Date.now()}/400/240`, ...ad };
  data[category] = [newAd, ...data[category]];
  save(data);
  return newAd;
}

export function removeAd(category, id) {
  const data = load();
  data[category] = (data[category] || []).filter(a => a.id !== id);
  save(data);
}


