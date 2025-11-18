import { useState, useRef, useEffect } from 'react';
import { aiAPI, tripsAPI } from '../utils/api';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI travel assistant. I can help you plan trips, answer questions about destinations, and create personalized itineraries. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTrips();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTrips = async () => {
    try {
      const response = await tripsAPI.getAll();
      setTrips(response.data);
    } catch (err) {
      console.error('Failed to load trips');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const context = {
        userTrips: trips.map(t => ({
          destination: t.destination,
          dates: { start: t.startDate, end: t.endDate },
          budget: t.budget
        }))
      };

      const response = await aiAPI.chat(userMessage, context);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateItinerary = async () => {
    const destination = prompt('Enter destination:');
    if (!destination) return;

    const days = prompt('Number of days:');
    if (!days) return;

    const budget = prompt('Budget (e.g., 50000):');
    if (!budget) return;

    setLoading(true);
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: `Generate a ${days}-day itinerary for ${destination} with a budget of ₹${budget}` 
    }]);

    try {
      const response = await aiAPI.generateItinerary({
        destination,
        days: parseInt(days),
        budget: parseFloat(budget),
        currency: 'INR'
      });

      const itineraryText = JSON.stringify(response.data.itinerary, null, 2);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Here's your itinerary:\n\n${itineraryText}\n\nWould you like me to save this as a trip?` 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error generating the itinerary. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">AI Travel Assistant</h1>
          <p className="text-sm text-blue-100">Ask me anything about travel planning!</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <p className="text-gray-500">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-2 flex gap-2">
            <button
              onClick={generateItinerary}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
            >
              Generate Itinerary
            </button>
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;

