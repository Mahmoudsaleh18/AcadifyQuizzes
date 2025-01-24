'use client';

import { useAuth } from '@/lib/auth/useAuth';
import Link from 'next/link';

export default function DashboardLayout({ children, requiredRole }) {
  const { user, loading } = useAuth(requiredRole);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center px-2 py-2 text-gray-900">
                Quiz Platform
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">{user?.name}</span>
              <button
                onClick={() => auth.signOut()}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 