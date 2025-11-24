import express from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// AI Chatbot endpoint
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ 
        message: 'AI API key not configured',
        response: 'Please set GEMINI_API_KEY in your environment variables.'
      });
    }

    const systemPrompt = `You are a helpful AI travel assistant. Help users plan trips, answer travel questions, and create itineraries.
    ${context ? `Context: ${JSON.stringify(context)}` : ''}
    Provide helpful, practical travel advice.`;

    const geminiResp = await axios.post(
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-latest:generateContent?key=${geminiKey}`,
  {
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'user', parts: [{ text: message }] }
    ]
  }
);

    const response = geminiResp.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    res.json({ response });
  } catch (error) {
    console.error('AI API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'AI service error',
      error: error.response?.data || error.message,
      response: 'I apologize, but I encountered an error. Please try again later.'
    });
  }
});

// Generate itinerary
router.post('/generate-itinerary', authenticate, async (req, res) => {
  try {
    const { destination, days, budget, currency, preferences } = req.body;

    if (!destination || !days || !budget) {
      return res.status(400).json({ message: 'Destination, days, and budget are required' });
    }

    const prompt = `Create a detailed ${days}-day travel itinerary for ${destination} with a budget of ${budget} ${currency || 'INR'}.
    ${preferences ? `User preferences: ${preferences}` : ''}
    
    Format the response as a JSON object with this structure:
    {
      "itinerary": [
        {
          "day": 1,
          "date": "YYYY-MM-DD",
          "activities": [
            {
              "time": "HH:MM",
              "activity": "Activity name",
              "location": "Location name",
              "notes": "Additional notes"
            }
          ]
        }
      ],
      "totalEstimatedCost": "estimated cost",
      "tips": ["tip1", "tip2"]
    }
    
    Include practical, realistic activities and try to stay within budget.`;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return res.status(500).json({ message: 'AI API key not configured' });

    const geminiResp = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-latest:generateContent?key=${geminiKey}`,
      {
        contents: [
          { role: 'user', parts: [{ text: 'You are a travel itinerary planner. Always respond with valid JSON only.' }] },
          { role: 'user', parts: [{ text: prompt }] }
        ]
      }
    );

    const text = geminiResp.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const safe = text.replace(/```json\n?|\n?```/g, '');
    const itineraryData = JSON.parse(safe);
    res.json(itineraryData);
  } catch (error) {
    console.error('Itinerary Generation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Error generating itinerary',
      error: error.response?.data || error.message
    });
  }
});

export default router;

