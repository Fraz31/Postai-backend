import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: "PostAI Backend API",
    status: "running",
    endpoints: {
      health: "/health",
      api: "/api"
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: "Backend working!", 
    key: process.env.API_KEY ? "API key is set" : "no key set",
    timestamp: new Date().toISOString()
  });
});

// Generate content endpoint (for form submissions)
app.post('/api', (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ 
      error: "Prompt is required",
      message: "Please provide a prompt in the request body"
    });
  }

  // For now, return a simple response
  // Later you can integrate OpenAI, Notion, or other services here
  res.json({
    success: true,
    message: "Content generation endpoint is ready!",
    prompt: prompt,
    note: "Connect your AI service (OpenAI, etc.) to generate actual content",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

