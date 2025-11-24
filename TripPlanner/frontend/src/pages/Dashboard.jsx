import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading and ensure user is logged in
    if (authLoading) {
      return;
    }
    if (!user) {
      setLoading(false);
      setError('Please log in to view your trips');
      return;
    }
    // Double-check token exists before making request
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setError('Authentication required. Please log in again.');
      return;
    }
    fetchTrips();
  }, [authLoading, user]);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await tripsAPI.getAll();
      setTrips(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      if (err?.response?.status === 401) {
        // Don't clear token here - let AuthContext handle it via /auth/me
        // Just show error message
        setError('Session expired. Please refresh the page or log in again.');
      } else {
        setError('Failed to load trips. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const upcomingTrips = trips.filter(trip => 
    new Date(trip.endDate) >= new Date() && trip.status !== 'completed'
  ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const completedTrips = trips.filter(trip => trip.status === 'completed');

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Travel Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your trips and plan your next adventure</p>
      </div>

      <div className="mb-6">
        <Link
          to="/itinerary-planner"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          + Create New Trip
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Upcoming Trips */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Trips</h2>
        {upcomingTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No upcoming trips. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTrips.map((trip) => (
              <Link
                key={trip._id}
                to={`/trip/${trip._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{trip.destination}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    trip.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trip.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {format(new Date(trip.startDate), 'MMM dd')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                </p>
                <p className="text-gray-700 font-medium">
                  Budget: {trip.currency} {trip.budget.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed Trips */}
      {completedTrips.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Completed Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTrips.map((trip) => (
              <Link
                key={trip._id}
                to={`/trip/${trip._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 opacity-75"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{trip.destination}</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    completed
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {format(new Date(trip.startDate), 'MMM dd')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                </p>
                <p className="text-gray-700 font-medium">
                  Budget: {trip.currency} {trip.budget.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

