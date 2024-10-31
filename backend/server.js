const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
      model: "gpt-3.5-turbo",
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
      model: "gpt-3.5-turbo",
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
  const { prompt, attributes } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a categorization system. Based on the item attributes, return a JSON object with only two fields: category and subcategory. Example categories: Electronics, Accessories, Documents, etc."
        },
        {
          role: "user",
          content: `Categorize this item: ${JSON.stringify(attributes)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(response.choices[0].message.content));
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to categorize item' });
  }
});

app.get('/api/test-openai', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say hello world"
        }
      ]
    });
    
    console.log('OpenAI Test Response:', response);
    res.json(response);
  } catch (error) {
    console.error('OpenAI Test Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/check-key', (req, res) => {
  const key = process.env.OPENAI_API_KEY;
  console.log('Full API Key:', key);
  res.json({ 
    hasKey: !!key,
    keyLength: key?.length,
    startsWithSk: key?.startsWith('sk-'),
    firstFourChars: key?.substring(0, 4)
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
