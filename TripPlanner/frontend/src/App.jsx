import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdsDashboard from './pages/AdsDashboard';
import HotelsAds from './pages/HotelsAds';
import TripsAds from './pages/TripsAds';
import TransportAds from './pages/TransportAds';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import TripDetail from './pages/TripDetail';
import ExpenseTracker from './pages/ExpenseTracker';
import Chatbot from './pages/Chatbot';
import ItineraryPlanner from './pages/ItineraryPlanner';
import Navbar from './components/Navbar';
import Checkout from './pages/Checkout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/ads" element={<PrivateRoute><AdsDashboard /></PrivateRoute>} />
          <Route path="/ads/hotels" element={<PrivateRoute><HotelsAds /></PrivateRoute>} />
          <Route path="/ads/trips" element={<PrivateRoute><TripsAds /></PrivateRoute>} />
          <Route path="/ads/transport" element={<PrivateRoute><TransportAds /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/trip/:id" element={<PrivateRoute><TripDetail /></PrivateRoute>} />
          <Route path="/expenses/:tripId" element={<PrivateRoute><ExpenseTracker /></PrivateRoute>} />
          <Route path="/chatbot" element={<PrivateRoute><Chatbot /></PrivateRoute>} />
          <Route path="/itinerary-planner" element={<PrivateRoute><ItineraryPlanner /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

