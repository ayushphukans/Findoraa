import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { extractAttributes } from './attributeService';
import { openai } from '../config/openai';

export const findPotentialMatches = async (newItem, topN = 5) => {
  console.log('🔍 Finding potential matches for:', newItem);

  try {
    // Step 1: Get items from the same category
    const itemsRef = collection(db, 'items');
    const q = query(
      itemsRef,
      where('category', '==', newItem.category),
      where('subcategory', '==', newItem.subcategory)
    );
    
    const querySnapshot = await getDocs(q);
    const matchesPool = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Step 2: Attribute-Based Filtering
    const filteredMatches = matchesPool.filter(item => {
      // Skip the same item
      if (item.id === newItem.id) return false;
      
      // Filter based on lost/found status (opposite of new item)
      if (item.lostOrFound === newItem.lostOrFound) return false;
      
      // Filter by date range (within 30 days)
      const itemDate = new Date(item.date);
      const newItemDate = new Date(newItem.date);
      const daysDifference = Math.abs((itemDate - newItemDate) / (1000 * 60 * 60 * 24));
      if (daysDifference > 30) return false;

      return true;
    });

    // Step 3: Calculate Similarity Scores using OpenAI
    const scoredMatches = await Promise.all(
      filteredMatches.map(async (item) => {
        const { score, justification } = await calculateSimilarityScore(newItem, item);
        return {
          item,
          similarityScore: score,
          justification
        };
      })
    );

    // Step 4: Sort by score descending
    scoredMatches.sort((a, b) => b.similarityScore - a.similarityScore);

    // Step 5: Return top N matches
    return scoredMatches.slice(0, topN);

  } catch (error) {
    console.error('❌ Error finding matches:', error);
    return [];
  }
};

const calculateSimilarityScore = async (newItem, existingItem) => {
  try {
    const prompt = `
      You are an intelligent lost and found matching system. Compare these two items and:
      1. Calculate a similarity score (0-100)
      2. Provide a detailed justification for the score
      
      New Item:
      - Type: ${newItem.category}/${newItem.subcategory}
      - Description: ${newItem.description}
      - Location: ${newItem.location}
      - Date: ${newItem.date}
      
      Existing Item:
      - Type: ${existingItem.category}/${existingItem.subcategory}
      - Description: ${existingItem.description}
      - Location: ${existingItem.location}
      - Date: ${existingItem.date}
      
      Response Format:
      {
        "score": number,
        "justification": "detailed explanation"
      }
    `;

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

    const result = JSON.parse(response.choices[0]?.message?.content || '{"score":0, "justification":"Error processing match"}');
    return result;

  } catch (error) {
    console.error('❌ Error calculating similarity:', error);
    return { score: 0, justification: "Error calculating similarity score" };
  }
};

// Helper function to present matches in the UI
export const formatMatchesForDisplay = (matches) => {
  return matches.map(match => ({
    id: match.item.id,
    score: match.similarityScore,
    justification: match.justification,
    details: {
      title: match.item.title,
      description: match.item.description,
      location: match.item.location,
      date: match.item.date,
      category: match.item.category,
      subcategory: match.item.subcategory
    }
  }));
};



