import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tripsAPI } from '../utils/api';
import { format } from 'date-fns';

function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await tripsAPI.getById(id);
      setTrip(response.data);
    } catch (err) {
      setError('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Trip not found'}
        </div>
        <Link to="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const getItineraryByDay = () => {
    const grouped = {};
    trip.itinerary.forEach(item => {
      if (!grouped[item.day]) {
        grouped[item.day] = [];
      }
      grouped[item.day].push(item);
    });
    return grouped;
  };

  const itineraryByDay = getItineraryByDay();
  const days = Object.keys(itineraryByDay).sort((a, b) => a - b);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.destination}</h1>
            <p className="text-gray-600">
              {format(new Date(trip.startDate), 'MMMM dd, yyyy')} - {format(new Date(trip.endDate), 'MMMM dd, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Budget</p>
            <p className="text-2xl font-bold text-blue-600">
              {trip.currency} {trip.budget.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <Link
            to={`/expenses/${trip._id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            View Expenses
          </Link>
          <span className={`px-3 py-1 rounded-full text-sm ${
            trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            trip.status === 'ongoing' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {trip.status}
          </span>
        </div>

        {trip.notes && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Notes:</h3>
            <p className="text-gray-700">{trip.notes}</p>
          </div>
        )}
      </div>

      {/* Itinerary Calendar View */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
        
        {days.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No itinerary planned yet. Use the AI Assistant to generate one!
          </div>
        ) : (
          <div className="space-y-6">
            {days.map(day => {
              const dayItems = itineraryByDay[day];
              return (
                <div key={day} className="border-l-4 border-blue-500 pl-4 pb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Day {day} - {dayItems[0]?.date ? format(new Date(dayItems[0].date), 'MMMM dd, yyyy') : ''}
                  </h3>
                  <div className="space-y-3">
                    {dayItems.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        {item.activities.map((activity, actIdx) => (
                          <div key={actIdx} className="bg-gray-50 rounded-md p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-sm font-medium text-blue-600">{activity.time}</span>
                                  <span className="font-semibold text-gray-900">{activity.activity}</span>
                                </div>
                                {activity.location && (
                                  <p className="text-sm text-gray-600">📍 {activity.location}</p>
                                )}
                                {activity.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{activity.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TripDetail;

