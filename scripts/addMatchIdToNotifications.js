/**
 * Migration script: add a computed matchId field to existing notifications.
 * Usage: node scripts/addMatchIdToNotifications.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize the Firebase Admin SDK (assumes GOOGLE_APPLICATION_CREDENTIALS env var is set)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = admin.firestore();

async function main() {
  console.log('Starting migration: adding matchId to notifications...');
  const notifCol = db.collection('notifications');
  const snapshot = await notifCol.get();
  console.log(`Found ${snapshot.size} notifications.`);
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    // Skip if matchId already exists
    if (data.matchId) continue;

    const lostId = data.lostItemId;
    const foundId = data.foundItemId;
    if (!lostId || !foundId) {
      console.warn(`Skipping ${doc.id}: missing lostItemId or foundItemId`);
      continue;
    }
    // Compute a stable matchId
    const matchId = [lostId, foundId].sort().join('_');
    await doc.ref.update({ matchId });
    updatedCount++;
    console.log(`Updated ${doc.id} → matchId: ${matchId}`);
  }

  console.log(`Migration complete. Updated ${updatedCount} documents.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
