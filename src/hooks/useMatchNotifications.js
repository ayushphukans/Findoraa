import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function useMatchNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'confirmed_matches'),
      where('notified', '!=', userId)
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const relevant = [];
      let count = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.lostId === userId || data.foundId === userId) {
          relevant.push({ id: doc.id, ...data });
          count += 1;
        }
      });

      setNotifications(relevant);
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notifications, unreadCount };
}