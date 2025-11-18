# AI Travel Planner

A full-stack travel planning application with AI-powered itinerary generation, expense tracking, and trip management.

## Features

- 🎯 **User Authentication** - Secure JWT-based login/signup
- ✈️ **Trip Management** - Create, view, and manage your trips
- 📅 **Itinerary Calendar View** - Day-by-day trip planning with detailed schedules
- 💰 **Expense Tracker** - Track expenses with categories and visualize with charts
- 🤖 **AI Travel Assistant** - Chatbot powered by OpenAI/Claude for travel questions and itinerary generation
- 💾 **Itinerary Planner** - Save itineraries from websites or generate new ones for future trips
- 📊 **Analytics** - Budget vs spending charts and expense breakdowns

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts (for charts)
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- bcryptjs for password hashing

### AI Integration
- OpenAI GPT-3.5 Turbo (or Claude API)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API Key (or Claude API Key)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
# OR use Claude:
# CLAUDE_API_KEY=your_claude_api_key
```

4. Start the backend server:
```bash
npm run dev
# or
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
semproject/
├── backend/
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── Trip.js
│   │   ├── Expense.js
│   │   └── SavedItinerary.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── trips.js
│   │   ├── expenses.js
│   │   ├── ai.js
│   │   └── savedItineraries.js
│   ├── middleware/      # Authentication middleware
│   │   └── auth.js
│   ├── server.js        # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   │   └── Navbar.jsx
    │   ├── pages/       # Page components
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── TripDetail.jsx
    │   │   ├── ExpenseTracker.jsx
    │   │   ├── Chatbot.jsx
    │   │   └── ItineraryPlanner.jsx
    │   ├── context/     # React Context (Auth)
    │   │   └── AuthContext.jsx
    │   ├── utils/       # Utility functions
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Trips
- `GET /api/trips` - Get all trips for user
- `GET /api/trips/:id` - Get single trip
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Expenses
- `GET /api/expenses?tripId=:tripId` - Get expenses (optionally filtered by trip)
- `GET /api/expenses/stats/:tripId` - Get expense statistics
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### AI
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/generate-itinerary` - Generate itinerary

### Saved Itineraries
- `GET /api/saved-itineraries` - Get all saved itineraries
- `GET /api/saved-itineraries/:id` - Get single saved itinerary
- `POST /api/saved-itineraries` - Save itinerary
- `PUT /api/saved-itineraries/:id` - Update saved itinerary
- `DELETE /api/saved-itineraries/:id` - Delete saved itinerary

## Usage

1. **Sign up** for a new account or **login** with existing credentials
2. **Create a trip** using the Itinerary Planner page:
   - Generate an AI-powered itinerary
   - Or manually save an itinerary for future use
3. **View your trips** on the Dashboard
4. **Add expenses** to track your spending against budget
5. **Use the AI Assistant** to ask travel questions or generate new itineraries
6. **Save itineraries** from your existing trips for future reference

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `OPENAI_API_KEY` - OpenAI API key (or use CLAUDE_API_KEY)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Development

- Backend: `npm run dev` (uses nodemon for auto-reload)
- Frontend: `npm run dev` (Vite development server)

## Production Build

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

### Backend
```bash
cd backend
npm start
```

## Notes

- Make sure MongoDB is running before starting the backend
- Add your API keys to the backend `.env` file for AI features to work
- The application uses JWT tokens stored in localStorage for authentication
- All API routes (except auth) require authentication via JWT token

## License

MIT

