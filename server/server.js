require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Function to compare descriptions using Ollama
async function compareDescriptions(desc1, desc2) {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: "nemotron-3-2b",
      prompt: `Compare the similarity of these two item descriptions:
               1: ${desc1}
               2: ${desc2}
               Provide a similarity score between 0 and 100.`,
      stream: false
    });
    
    // Extract the similarity score from the response
    const similarityScore = parseInt(response.data.response.match(/\d+/)[0]);
    return similarityScore;
  } catch (error) {
    console.error('Error calling Ollama:', error);
    return 0;
  }
}

// Endpoint to find potential matches
app.post('/api/find-matches', async (req, res) => {
  const { itemId, description, type } = req.body;
  const oppositeType = type === 'lost' ? 'found' : 'lost';

  try {
    const itemsRef = db.collection('items');
    const oppositeItems = await itemsRef.where('lostOrFound', '==', oppositeType).get();

    const potentialMatches = [];
    for (const doc of oppositeItems.docs) {
      const item = { id: doc.id, ...doc.data() };
      const similarity = await compareDescriptions(description, item.description);
      if (similarity > 70) {
        potentialMatches.push({ item, similarity });
      }
    }

    res.json(potentialMatches);
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'An error occurred while finding matches' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
