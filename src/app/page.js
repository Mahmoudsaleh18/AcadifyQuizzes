"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111113] flex items-center justify-center">
      {/* Hero Section */}
      <div className="relative overflow-hidden w-full">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#2ECC71]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-[#2ECC71]/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Welcome to <span className="text-[#2ECC71]">Acadify</span> Quizzes
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Empower your learning journey with our interactive quiz platform. Create, share, and excel in your educational experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup"
                className="bg-[#2ECC71] text-black px-8 py-3 rounded-lg font-medium hover:bg-[#2ECC71]/90 transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/login"
                className="bg-[#09090B] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2ECC71]/10 transition-colors border border-[#2ECC71]/20"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
