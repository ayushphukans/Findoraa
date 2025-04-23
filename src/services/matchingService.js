import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { makeOpenAIRequest } from '../config/openai';

export const findPotentialMatches = async (newItem, topN = 5) => {
  console.log('🔍 Finding potential matches for:', newItem);

  try {
    const itemsRef = collection(db, 'items');
    const q = query(
      itemsRef,
      where('subcategory', '==', newItem.subcategory),
      where('category', '==', newItem.category)
    );

    const snapshot = await getDocs(q);
    const potentialMatches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const filtered = potentialMatches.filter(item => {
      if (item.id === newItem.id) return false;
      if (item.lostOrFound === newItem.lostOrFound) return false;

      const newDate = new Date(newItem.date);
      const existingDate = new Date(item.date);
      const dayDiff = Math.abs((newDate - existingDate) / (1000 * 60 * 60 * 24));
      if (dayDiff > 30) return false;

      return true;
    });

    const scoredMatches = [];

    for (const item of filtered) {
      const alreadyCompared = await wasCompared(newItem.id, item.id);
      if (alreadyCompared) continue;

      const { score, justification } = await calculateSimilarityScore(newItem, item);

      // ───── determine confidence tier ─────
      let confidence = 'unlikely';
      if (score >= 80) {
        confidence = 'high';
      } else if (score >= 60) {
        confidence = 'possible';
      }

      // store comparison outcome (true if "high" or "possible")
      await saveComparison(newItem, item, score, confidence !== 'unlikely', justification);

      if (confidence !== 'unlikely') {
        await notifyMatchUsers(newItem, item, score, justification, confidence);
        scoredMatches.push({ item, similarityScore: score, justification, confidence });
      }
    }

    scoredMatches.sort((a, b) => b.similarityScore - a.similarityScore);
    return scoredMatches.slice(0, topN);

  } catch (error) {
    console.error('❌ Error finding matches:', error);
    return [];
  }
};

const wasCompared = async (id1, id2) => {
  const matchId = [id1, id2].sort().join('_');
  const ref = doc(db, 'match_attempts', matchId);
  const docSnap = await getDoc(ref);
  return docSnap.exists();
};

const saveComparison = async (newItem, existingItem, score, matched, justification = '') => {
  console.log('🧪 saveComparison received:', {
    newItemId: newItem?.id,
    existingItemId: existingItem?.id
  });
  if (!newItem?.id || !existingItem?.id) {
    console.warn('⚠️ Skipping match save due to missing ID(s):', {
      newItemId: newItem?.id,
      existingItemId: existingItem?.id
    });
    return;
  }
  const matchId = [newItem.id, existingItem.id].sort().join('_');
  const ref = doc(db, 'match_attempts', matchId);

  const allLower = (val) => typeof val === 'string' ? val.toLowerCase() : '';
  
  const newType = allLower(newItem.lostOrFound);
  const existingType = allLower(existingItem.lostOrFound);
  
  const lostItem = newType === 'lost' ? newItem : existingType === 'lost' ? existingItem : null;
  const foundItem = newType === 'found' ? newItem : existingType === 'found' ? existingItem : null;
  console.log('🧪 Match assignment debug:', {
    newItemId: newItem.id,
    newItemType: newType,
    existingItemId: existingItem.id,
    existingItemType: existingType,
    resolvedLostId: lostItem?.id,
    resolvedFoundId: foundItem?.id
  });

  if (!foundItem || !lostItem) {
    console.warn('⚠️ Skipping match save due to missing or invalid lostOrFound field:', {
      newItemId: newItem.id,
      newItemType: newItem.lostOrFound,
      existingItemId: existingItem.id,
      existingItemType: existingItem.lostOrFound
    });
    return;
  }

  await setDoc(ref, {
    lostId: lostItem.id,
    foundId: foundItem.id,
    compared: true,
    matchScore: score,
    justification,
    matched,
    comparedAt: new Date().toISOString()
  });
};

const notifyMatchUsers = async (newItem, existingItem, score, justification, confidence) => {
  console.log('📬 notifyMatchUsers received:', {
    newItemId: newItem?.id,
    existingItemId: existingItem?.id
  });
  if (!newItem?.id || !existingItem?.id) {
    console.warn('⚠️ Skipping notification due to missing ID(s):', {
      newItemId: newItem?.id,
      existingItemId: existingItem?.id
    });
    return;
  }
  const allLower = (val) => typeof val === 'string' ? val.toLowerCase() : '';
  
  const newType = allLower(newItem.lostOrFound);
  const existingType = allLower(existingItem.lostOrFound);
  
  const lostItem = newType === 'lost' ? newItem : existingType === 'lost' ? existingItem : null;
  const foundItem = newType === 'found' ? newItem : existingType === 'found' ? existingItem : null;
  console.log('📬 Notification assignment debug:', {
    newItemId: newItem.id,
    newItemType: newType,
    existingItemId: existingItem.id,
    existingItemType: existingType,
    resolvedLostId: lostItem?.id,
    resolvedFoundId: foundItem?.id
  });

  if (!foundItem || !lostItem) {
    console.warn('⚠️ Skipping notification save due to missing or invalid lostOrFound field:', {
      newItemId: newItem.id,
      newItemType: newItem.lostOrFound,
      existingItemId: existingItem.id,
      existingItemType: existingItem.lostOrFound
    });
    return;
  }

  const ref = collection(db, 'confirmed_matches');
  await addDoc(ref, {
    lostId: lostItem.id,
    foundId: foundItem.id,
    similarity: score,
    confidence,          //  "high" or "possible"
    justification,
    chatStarted: false,
    createdAt: new Date().toISOString()
  });
  /* ----------  NEW: push unread notifications for both parties  ---------- */
  try {
    const notifRef = collection(db, 'notifications');
    const batch = writeBatch(db);

    const buildPayload = (receiverId) => ({
      receiverId,
      lostItemId: lostItem.id,
      foundItemId: foundItem.id,
      similarity: score,
      confidence,
      justification,
      read: false,
      createdAt: new Date().toISOString()
    });

    batch.set(doc(notifRef), buildPayload(lostItem.userId));
    batch.set(doc(notifRef), buildPayload(foundItem.userId));

    await batch.commit();
  } catch (err) {
    console.error('❌ Error writing notifications:', err);
  }
  /* ----------------------------------------------------------------------- */
};

const calculateSimilarityScore = async (newItem, existingItem) => {
  try {
    const prompt = `
You are an expert LOST-AND-FOUND matching agent.
Decide whether the two item reports below describe **the same physical item**.

════════════════  PHASE 1  (Human-style plausibility)  ════════════════
Give an overall rating **stars** ∈ {1-5}:

5 ⭐  Almost certainly the same item  
4 ⭐  Very strong match  
3 ⭐  Possibly the same – worth contacting both users  
2 ⭐  Unlikely  
1 ⭐  Clearly different  

– Think like a helpful human: allow for location drift, partial accessory sets, paraphrased wording, etc.  
– Do **not** subtract points here; stars reflect gut confidence only.

════════════════  PHASE 2  (Structured rubric; max 70 pts)  ════════════
Apply **only if stars ≥ 3**.  Award points (never subtract):

| Bucket | Max pts | What counts |
|--------|---------|-------------|
| **A. Unique identifiers / markings** | 25 | serial numbers, engravings, custom stickers, distinctive damage, text on labels **or recognisable paraphrase/partial** |
| **B. Item type + variant** | 15 | same specific sub-type (e.g. “mirrorless camera” vs “camera”), form factor, variant |
| **C. Brand / make / model** | 10 | manufacturer, issuer, series name—even if given in only one report but logically implied |
| **D. Physical attributes** | 10 | colour, material, size, pattern; award higher for primary attributes |
| **E. Context clues** | 15 | route / seat / station, accessory subset (e.g. lost “bag + charger”, found “charger” with matching score sticker), usage scenario, packaging, etc. |
| **F. Date proximity** | 5 | same calendar day 5, ±1‑3 days 3, ±4‑7 days 1 |

════════════════  FINAL SCORE  ════════════════
**Total = (stars × 6) + rubricPoints**, cap 100.  
≥ 80 → “high-confidence”    60‑79 → “possible”    < 60 → “unlikely”.

════════════════  OUTPUT FORMAT  ════════════════
Return **only** valid JSON:

{
  "score": <integer 0-100>,
  "justification": "<≤250 chars summarising the main overlaps / doubts>"
}

No markdown, no other keys.

════════════════  DATA  ════════════════
# NEW ITEM
Title: "${newItem.title}"
Description: "${newItem.description}"
Attributes: ${JSON.stringify(newItem.attributes)}
Location: "${newItem.location}"
Date: "${newItem.date}"

# EXISTING ITEM
Title: "${existingItem.title}"
Description: "${existingItem.description}"
Attributes: ${JSON.stringify(existingItem.attributes)}
Location: "${existingItem.location}"
Date: "${existingItem.date}"
`;
    const result = await makeOpenAIRequest('calculate-similarity', { prompt });
    return result || { score: 0, justification: "No response from LLM" };
  } catch (err) {
    console.error('❌ Error in calculateSimilarityScore:', err);
    return { score: 0, justification: "Error calculating score" };
  }
};

export const formatMatchesForDisplay = (matches) => {
  return matches.map(match => ({
    id: match.item.id,
    score: match.similarityScore,
    justification: match.justification,
    confidence: match.confidence,
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
