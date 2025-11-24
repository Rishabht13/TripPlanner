import { useState, useEffect } from 'react';
import { savedItinerariesAPI, tripsAPI, aiAPI } from '../utils/api';
import { format } from 'date-fns';

function ItineraryPlanner() {
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    destination: '',
    days: '',
    budget: '',
    currency: 'INR',
    preferences: ''
  });
  const [saveForm, setSaveForm] = useState({
    title: '',
    destination: '',
    duration: '',
    budget: '',
    itineraryData: {},
    notes: '',
    tags: '',
    plannedForDate: ''
  });
  const [generatedItinerary, setGeneratedItinerary] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [savedRes, tripsRes] = await Promise.all([
        savedItinerariesAPI.getAll(),
        tripsAPI.getAll()
      ]);
      setSavedItineraries(savedRes.data);
      setTrips(tripsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateItinerary = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await aiAPI.generateItinerary({
        destination: generateForm.destination,
        days: parseInt(generateForm.days),
        budget: parseFloat(generateForm.budget),
        currency: generateForm.currency,
        preferences: generateForm.preferences
      });
      setGeneratedItinerary(response.data);
      setSaveForm({
        title: `${generateForm.destination} - ${generateForm.days} days`,
        destination: generateForm.destination,
        duration: generateForm.days,
        budget: generateForm.budget,
        itineraryData: response.data.itinerary || response.data,
        notes: response.data.tips?.join('\n') || '',
        tags: '',
        plannedForDate: ''
      });
      setShowGenerateForm(false);
      setShowSaveForm(true);
    } catch (err) {
      alert('Failed to generate itinerary. Make sure AI API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = async (e) => {
    e.preventDefault();
    try {
      await savedItinerariesAPI.create({
        ...saveForm,
        duration: parseInt(saveForm.duration),
        budget: parseFloat(saveForm.budget),
        tags: saveForm.tags ? saveForm.tags.split(',').map(t => t.trim()) : [],
        plannedForDate: saveForm.plannedForDate || null
      });
      setShowSaveForm(false);
      setGeneratedItinerary(null);
      setSaveForm({
        title: '',
        destination: '',
        duration: '',
        budget: '',
        itineraryData: {},
        notes: '',
        tags: '',
        plannedForDate: ''
      });
      fetchData();
      alert('Itinerary saved successfully!');
    } catch (err) {
      alert('Failed to save itinerary');
    }
  };

  const handleSaveFromWebsite = (trip) => {
    setSaveForm({
      title: `${trip.destination} - ${trip.itinerary.length} days`,
      destination: trip.destination,
      duration: Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)),
      budget: trip.budget.toString(),
      itineraryData: trip.itinerary || [],
      notes: trip.notes || '',
      tags: '',
      plannedForDate: ''
    });
    setGeneratedItinerary(null);
    setShowSaveForm(true);
  };

  const handleConvertToTrip = async (savedItinerary) => {
    const startDate = savedItinerary.plannedForDate 
      ? new Date(savedItinerary.plannedForDate)
      : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + parseInt(savedItinerary.duration) - 1);

    try {
      await tripsAPI.create({
        destination: savedItinerary.destination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        budget: savedItinerary.budget,
        currency: 'INR',
        itinerary: Array.isArray(savedItinerary.itineraryData) 
          ? savedItinerary.itineraryData 
          : savedItinerary.itineraryData.itinerary || [],
        notes: savedItinerary.notes,
        status: 'upcoming'
      });
      alert('Trip created successfully!');
      // Optionally delete saved itinerary
      // await savedItinerariesAPI.delete(savedItinerary._id);
      // fetchData();
    } catch (err) {
      alert('Failed to create trip');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this saved itinerary?')) {
      try {
        await savedItinerariesAPI.delete(id);
        fetchData();
      } catch (err) {
        alert('Failed to delete itinerary');
      }
    }
  };

  if (loading && savedItineraries.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Itinerary Planner</h1>
        <p className="mt-2 text-gray-600">
          Save itineraries you find on websites or generate new ones with AI for your future trips
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => { setShowGenerateForm(true); setShowSaveForm(false); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Generate Itinerary with AI
        </button>
        <button
          onClick={() => { setShowSaveForm(true); setShowGenerateForm(false); setGeneratedItinerary(null); }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Save Manual Itinerary
        </button>
      </div>

      {/* Generate Itinerary Form */}
      {showGenerateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Generate AI Itinerary</h2>
          <form onSubmit={handleGenerateItinerary} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  value={generateForm.destination}
                  onChange={(e) => setGenerateForm({ ...generateForm, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  placeholder="e.g., Paris, Tokyo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                <input
                  type="number"
                  value={generateForm.days}
                  onChange={(e) => setGenerateForm({ ...generateForm, days: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="1"
                  placeholder="e.g., 4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="number"
                  value={generateForm.budget}
                  onChange={(e) => setGenerateForm({ ...generateForm, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                  placeholder="e.g., 50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={generateForm.currency}
                  onChange={(e) => setGenerateForm({ ...generateForm, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferences (optional)</label>
                <textarea
                  value={generateForm.preferences}
                  onChange={(e) => setGenerateForm({ ...generateForm, preferences: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="e.g., Prefer museums, love street food, budget-friendly"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Itinerary'}
              </button>
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Save Itinerary Form */}
      {showSaveForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            {generatedItinerary ? 'Save Generated Itinerary' : 'Save Itinerary'}
          </h2>
          {generatedItinerary && (
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold mb-2">Generated Itinerary Preview:</h3>
              <pre className="text-sm overflow-auto max-h-40">
                {JSON.stringify(generatedItinerary, null, 2)}
              </pre>
            </div>
          )}
          <form onSubmit={handleSaveItinerary} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={saveForm.title}
                  onChange={(e) => setSaveForm({ ...saveForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  value={saveForm.destination}
                  onChange={(e) => setSaveForm({ ...saveForm, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={saveForm.duration}
                  onChange={(e) => setSaveForm({ ...saveForm, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="number"
                  value={saveForm.budget}
                  onChange={(e) => setSaveForm({ ...saveForm, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned For Date (optional)</label>
                <input
                  type="date"
                  value={saveForm.plannedForDate}
                  onChange={(e) => setSaveForm({ ...saveForm, plannedForDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={saveForm.tags}
                  onChange={(e) => setSaveForm({ ...saveForm, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., beach, adventure, family"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={saveForm.notes}
                  onChange={(e) => setSaveForm({ ...saveForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Itinerary
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveForm(false);
                  setGeneratedItinerary(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Saved Itineraries from Website */}
      {trips.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Save from Your Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip._id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.destination}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {format(new Date(trip.startDate), 'MMM dd')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                </p>
                <p className="text-gray-700 font-medium mb-4">
                  Budget: {trip.currency} {trip.budget.toLocaleString()}
                </p>
                <button
                  onClick={() => handleSaveFromWebsite(trip)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save for Future
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Itineraries List */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Saved Future Itineraries</h2>
        {savedItineraries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No saved itineraries yet. Save one to plan your future trips!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItineraries.map((itinerary) => (
              <div key={itinerary._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{itinerary.title}</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    {itinerary.source}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">
                  <strong>Destination:</strong> {itinerary.destination}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Duration:</strong> {itinerary.duration} days
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Budget:</strong> ₹{itinerary.budget.toLocaleString()}
                </p>
                {itinerary.plannedForDate && (
                  <p className="text-gray-600 mb-2">
                    <strong>Planned for:</strong> {format(new Date(itinerary.plannedForDate), 'MMM dd, yyyy')}
                  </p>
                )}
                {itinerary.tags && itinerary.tags.length > 0 && (
                  <div className="mb-2">
                    {itinerary.tags.map((tag, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 mr-1 mb-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleConvertToTrip(itinerary)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Convert to Trip
                  </button>
                  <button
                    onClick={() => handleDelete(itinerary._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItineraryPlanner;

