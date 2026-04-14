import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Define API Key manually
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'API key is missing. Please configure GROQ_API_KEY in the .env file.' 
      });
    }

    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Call Groq API using native fetch
    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'Failed to get response from Groq API.' 
      });
    }

    const data = await response.json();
    
    // Extract the text part from the response
    let aiResponseText = 'No response generated.';
    if (data.choices && data.choices.length > 0) {
      aiResponseText = data.choices[0].message.content;
    }

    res.json({ response: aiResponseText });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
