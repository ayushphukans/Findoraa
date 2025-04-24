import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function useMatchNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'notifications'),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setUnreadCount(notifs.length);
    });
    return () => unsubscribe();
  }, [userId]);

  return { notifications, unreadCount };
}