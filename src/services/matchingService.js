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
      console.log('🧩 Match candidate before saving:', {
        newItemId: newItem?.id,
        existingItemId: item?.id,
        newItemType: newItem?.lostOrFound,
        existingItemType: item?.lostOrFound
      });
      await saveComparison(newItem, item, score, score >= 80);

      if (score >= 80) {
        await notifyMatchUsers(newItem, item, score, justification);
        scoredMatches.push({ item, similarityScore: score, justification });
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

const saveComparison = async (newItem, existingItem, score, matched) => {
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
    matched,
    comparedAt: new Date().toISOString()
  });
};

const notifyMatchUsers = async (newItem, existingItem, score, justification) => {
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
You are a LOST‑AND‑FOUND *matching algorithm* that must judge how similar two item
reports are.  Follow the rubric, sum the points (cap 100), then output JSON.

────────────────  SCORING RUBRIC  ────────────────
1. UNIQUE IDENTIFIERS (max 30)
   • Same engraving / tag text / serial number / sticker …………………… +30  
   • Same distinctive damage / pattern / mark …………………………………… +20  
   • Only generic colour/material overlap ………………………………………… +10  

2. ITEM TYPE & SUB‑TYPE (max 25)
   • Exact same sub‑subcategory (e.g. “Hats/Scarves → Beanie”) ……… +25  
   • Same item type but variant differs (beanie vs beret) ………………… +15  
   • Same broad category only …………………………………………………………… +5  

3. COLOUR (max 10)
   • Primary colour identical …………………………………………………………… +10  
   • Very similar shade (navy vs dark blue) ……………………………………… +7  
   • Only secondary colour matches ………………………………………………… +3  

4. BRAND / MODEL (max 10)
   • Exact brand or model matches …………………………………………………… +10  
   • Brand missing in one report but other cues suggest same make …… +5  

5. LOCATION PROXIMITY (max 10)
   • Same specific place (street / station / shop) ………………………………… +10  
   • Same neighbourhood (< 3 km) ……………………………………………………… +5  
   • Same city but far away ……………………………………………………………… +2  

6. DATE PROXIMITY (max 5)
   • Same day …………………………………………………………………………………… +5  
   • 1‑3 days difference ……………………………………………………………………… +3  
   • 4‑7 days difference ……………………………………………………………………… +1  

7. ACCESSORIES / SET RELATION (max 10)    <‑‑ NEW, bigger weight
   • *Exact* accessory set matches (hat **and** scarf) …………………………… +10  
   • One report lists a **subset** of the other but shares a unique  
     identifier on that subset item (e.g. lost “hat + scarf”, found only  
     hat **with same tag**) …………………………………………………………………… +7  
   • Some accessories match but no unique identifier …………………………… +4  

➜ TOTAL ≥ 80  →  *high‑confidence match*  
➜ 60 – 79     →  *possible match*  
➜ < 60        →  *unlikely match*

────────────────  OUTPUT FORMAT  ────────────────
Return **only** valid JSON:

{
  "score": <integer 0‑100>,
  "justification": "<≤250 chars explaining key overlaps / mismatches>"
}

NO markdown, no extra keys.

────────────────  DATA  ────────────────
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
