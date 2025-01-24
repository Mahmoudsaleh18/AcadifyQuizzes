'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { BookOpen, GraduationCap } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore - Create proper document reference
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setError('User data not found');
        return;
      }

      const userData = userDoc.data();

      // Update last login time - Use the same document reference
      await updateDoc(userDocRef, {
        lastLogin: new Date().toISOString()
      });

      // Redirect based on user role
      router.push(`/dashboard/${userData.role}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError('Error signing in: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24 bg-[#111113]">
        <div className="max-w-sm w-full mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Welcome <span className="text-[#2ECC71]">back</span></h1>
            <p className="text-gray-400">Please enter your details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 rounded-md bg-[#09090B] border border-[#2ECC71]/20 text-white focus:outline-none focus:border-[#2ECC71] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 rounded-md bg-[#09090B] border border-[#2ECC71]/20 text-white focus:outline-none focus:border-[#2ECC71] transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#2ECC71]/20 bg-[#09090B] text-[#2ECC71] focus:ring-[#2ECC71]"
                />
                <label className="ml-2 text-sm text-gray-400">
                  Remember for 30 days
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-[#2ECC71] hover:text-[#2ECC71]/80">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2ECC71] text-black font-medium py-2 rounded-md hover:bg-[#2ECC71]/90 transition-colors"
            >
              Sign in
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#2ECC71] hover:text-[#2ECC71]/80">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:block lg:w-1/2 bg-[#2ECC71]/10 relative overflow-hidden">
        {/* Background Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-32 h-32 bg-[#2ECC71]/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-[#2ECC71]/10 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[#2ECC71]/5 rounded-full blur-lg"></div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <h2 className="text-4xl font-bold text-white">
              Welcome to <span className="text-[#2ECC71]">Acadify</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Empower your learning journey with our interactive quiz platform
            </p>
            
            {/* Decorative Icons */}
            <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="bg-[#09090B] p-4 rounded-xl border border-[#2ECC71]/20 hover:bg-[#2ECC71]/10 transition-colors flex flex-col items-center">
                <div className="bg-[#2ECC71]/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-3">
                  <BookOpen className="text-[#2ECC71] w-6 h-6" />
                </div>
                <p className="text-white font-medium text-center">Interactive Quizzes</p>
              </div>
              <div className="bg-[#09090B] p-4 rounded-xl border border-[#2ECC71]/20 hover:bg-[#2ECC71]/10 transition-colors flex flex-col items-center">
                <div className="bg-[#2ECC71]/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-3">
                  <GraduationCap className="text-[#2ECC71] w-6 h-6" />
                </div>
                <p className="text-white font-medium text-center">Track Progress</p>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="absolute bottom-8 text-center">
            <p className="text-gray-400">
              Powered by <span className="text-[#2ECC71] font-medium">Acadify</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 