'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
            localStorage.setItem('userRole', userData.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUserRole(null);
        localStorage.removeItem('userRole');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('userRole');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-[#111113]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <span className="text-2xl font-bold text-white">
                Acad<span className="text-[#2ECC71]">ify</span>
            </span>
              </Link>
            {/* Desktop Menu */}
            {user && (
              <div className="hidden md:flex space-x-4">
                <Link
                  href={userRole === 'instructor' ? '/dashboard/instructor' : '/dashboard/student'}
                  className="px-3 py-2 rounded-md text-gray-300 hover:text-[#2ECC71] hover:bg-[#2ECC71]/10 transition-colors"
                >
                  Dashboard
                </Link>
                
                {userRole === 'instructor' && (
                  <Link
                    href="/quizzes/create"
                    className="px-3 py-2 rounded-md text-gray-300 hover:text-[#2ECC71] hover:bg-[#2ECC71]/10 transition-colors"
                  >
                    Create Quiz
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  {userRole === 'instructor' ? 'Instructor' : 'Student'}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-black bg-[#2ECC71] hover:bg-[#2ECC71]/90 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-md text-black bg-[#2ECC71] hover:bg-[#2ECC71]/90 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-[#2ECC71] transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#09090B] border-t border-[#2ECC71]/20">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  href={userRole === 'instructor' ? '/dashboard/instructor' : '/dashboard/student'}
                  className="block px-3 py-2 rounded-md text-gray-300 hover:text-[#2ECC71] hover:bg-[#2ECC71]/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {userRole === 'instructor' && (
                  <Link
                    href="/quizzes/create"
                    className="block px-3 py-2 rounded-md text-gray-300 hover:text-[#2ECC71] hover:bg-[#2ECC71]/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Quiz
                  </Link>
                )}
                
                <div className="pt-4 border-t border-[#2ECC71]/20">
                  <span className="block px-3 py-2 text-gray-400">
                    {userRole === 'instructor' ? 'Instructor' : 'Student'}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:text-[#2ECC71] hover:bg-[#2ECC71]/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-gray-300 hover:text-[#2ECC71] hover:bg-[#2ECC71]/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}