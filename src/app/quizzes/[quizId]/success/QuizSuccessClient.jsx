'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function QuizSuccessClient({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (quizDoc.exists()) {
          setQuiz(quizDoc.data());
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  if (loading) return <div>Loading...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="min-h-screen bg-[#111113] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#09090B] rounded-xl shadow-lg p-8 space-y-6 border border-[#2ECC71]/20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2ECC71] mb-2">
            Quiz Created Successfully!
          </h1>
          <p className="text-gray-400">{quiz.title}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              const link = `${window.location.origin}/quizzes/${quizId}`;
              navigator.clipboard.writeText(link);
            }}
            className="w-full bg-[#2ECC71]/10 text-[#2ECC71] px-4 py-2 rounded-md hover:bg-[#2ECC71]/20 transition-colors border border-[#2ECC71]/20"
          >
            Copy Quiz Link
          </button>

          <Link
            href={`/quizzes/${quizId}`}
            className="block w-full bg-[#2ECC71] text-black px-4 py-2 rounded-md hover:bg-[#2ECC71]/90 transition-colors text-center"
          >
            View Quiz
          </Link>

          <Link
            href="/dashboard/instructor"
            className="block w-full bg-[#111113] text-gray-300 px-4 py-2 rounded-md hover:bg-[#2ECC71]/10 hover:text-[#2ECC71] transition-colors text-center border border-[#2ECC71]/20"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
