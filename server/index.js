// server/index.js

const express = require('express');
const cors = require('cors');
const OpenAIApi = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the OpenAI client with Configuration
const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/match', async (req, res) => {
  const { description } = req.body;

  try {
    const prompt = `Find items that match the following description: "${description}"`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const matches = response.data.choices[0].text.trim();
    res.json({ matches });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
