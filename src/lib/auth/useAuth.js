import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export function useAuth(requiredRole) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        const userData = userDoc.data();
        
        if (requiredRole && userData.role !== requiredRole) {
          router.push('/unauthorized');
          return;
        }
        
        setUser({ ...authUser, ...userData });
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [requiredRole, router]);

  return { user, loading };
} 