import { db } from '../config/firebase';
import { collection, getDocs, query, where, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';

// Check that this URL matches your Ollama setup
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';

export const runMatchingService = async () => {
  try {
    // Prevent multiple runs
    if (window.isMatchingServiceRunning) {
      console.log("Matching service already running, skipping");
      return;
    }
    window.isMatchingServiceRunning = true;

    console.log("Starting matching service run");
    
    const lostQuery = query(collection(db, 'items'), where('lostOrFound', '==', 'Lost'));
    const foundQuery = query(collection(db, 'items'), where('lostOrFound', '==', 'Found'));

    const [lostSnapshot, foundSnapshot] = await Promise.all([
      getDocs(lostQuery),
      getDocs(foundQuery)
    ]);

    console.log(`Starting comparison of ${foundSnapshot.docs.length} found items and ${lostSnapshot.docs.length} lost items`);

    let comparisonCount = 0;
    const totalComparisons = lostSnapshot.docs.length * foundSnapshot.docs.length;

    const getSimilarityScore = async (text1, text2) => {
      try {
        const response = await fetch(OLLAMA_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "llama2",
            prompt: `Compare these two texts and return a similarity score between 0 and 100:
                    Text 1: "${text1}"
                    Text 2: "${text2}"
                    Return only the number, no other text.`,
            stream: false
          })
        });

        if (!response.ok) {
          console.error('Error calling Ollama:', response.status);
          // Fallback to simple text matching if API fails
          return calculateBasicSimilarity(text1, text2);
        }

        const data = await response.json();
        const score = parseInt(data.response);
        return isNaN(score) ? calculateBasicSimilarity(text1, text2) : score;

      } catch (error) {
        console.error('Error in similarity check:', error);
        // Fallback to simple text matching
        return calculateBasicSimilarity(text1, text2);
      }
    };

    // Add basic fallback similarity calculation
    const calculateBasicSimilarity = (text1, text2) => {
      const words1 = text1.toLowerCase().split(/\W+/);
      const words2 = text2.toLowerCase().split(/\W+/);
      const commonWords = words1.filter(word => words2.includes(word));
      return Math.round((commonWords.length * 2 / (words1.length + words2.length)) * 100);
    };

    for (const lostDoc of lostSnapshot.docs) {
      const lostItem = lostDoc.data();
      
      for (const foundDoc of foundSnapshot.docs) {
        const foundItem = foundDoc.data();
        comparisonCount++;
        
        console.log(`Processing comparison ${comparisonCount}/${totalComparisons}`);
        
        try {
          console.log(`Comparing:\nLost: ${lostItem.description}\nFound: ${foundItem.description}`);
          
          const score = await getSimilarityScore(lostItem.description, foundItem.description);
          
          console.log(`Similarity score: ${score}`);
          
          const comparisonData = {
            lostItemId: lostDoc.id,
            foundItemId: foundDoc.id,
            similarity: score,
            timestamp: new Date(),
            notificationSent: false
          };

          // Store comparison in Firebase
          await addDoc(collection(db, 'comparisons'), comparisonData);

          // If similarity is high, create notification
          if (score >= 80) {
            await createNotification({
              userId: lostItem.userId, // User who lost the item
              title: 'Potential Match Found!',
              message: `We found an item that matches your lost item description with ${score}% similarity.`,
              type: 'match',
              itemId: lostItem.id,
              matchedItemId: foundItem.id,
              status: 'unread',
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error storing comparison or sending notification:', error);
          continue;
        }
      }
    }
    
    console.log('Matching service completed successfully');
    
  } catch (error) {
    console.error("Error in matching service:", error);
  } finally {
    window.isMatchingServiceRunning = false;
  }
};

// Function to create notification
const createNotification = async (notificationData) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, notificationData);
    
    // If you're using FCM (Firebase Cloud Messaging), add this:
    if (notificationData.userId) {
      await sendPushNotification(notificationData);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Optional: Function to send push notification using FCM
const sendPushNotification = async (notificationData) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', notificationData.userId));
    const fcmToken = userDoc.data()?.fcmToken;

    if (fcmToken) {
      const message = {
        notification: {
          title: notificationData.title,
          body: notificationData.message
        },
        token: fcmToken
      };

      // Send to Firebase Cloud Function
      await fetch('YOUR_CLOUD_FUNCTION_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};
