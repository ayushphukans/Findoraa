import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

app.use(cors());
app.use(express.json());

app.post('/api/extract-attributes', async (req, res) => {
  const { prompt, item } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an attribute extractor. Always include the itemType in your response. Never return null for itemType if it can be determined from the description. Return a JSON object with lowercase keys."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const formattedResponse = {
      attributes: JSON.parse(response.choices[0].message.content),
      status: 'success'
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Failed to extract attributes',
      details: error.message,
      status: 'error'
    });
  }
});

app.post('/api/calculate-similarity', async (req, res) => {
  const { prompt, newItem, existingItem } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a precise matching system. Respond only with the JSON format specified."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    res.json(JSON.parse(response.choices[0].message.content));
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to calculate similarity' });
  }
});

app.post('/api/categorize-item', async (req, res) => {
  try {
    const { prompt, attributes } = req.body;
    
    // Debug what we're receiving
    console.log('📦 Received request body:', req.body);
    
    if (!prompt) {
      console.error('❌ No prompt received in request');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // or your chosen model
      messages: [{ 
        role: "user", 
        content: prompt 
      }]
    });

    console.log('✅ OpenAI Response:', response.choices[0].message.content);
    
    res.json(response.choices[0].message);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

