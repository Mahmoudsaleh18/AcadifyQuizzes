'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmissionSuccessClient({ quizId, submissionId }) {
  const [quiz, setQuiz] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quiz details
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (!quizDoc.exists()) {
          router.push('/dashboard/student');
          return;
        }
        setQuiz(quizDoc.data());

        // Fetch submission details
        const submissionDoc = await getDoc(doc(db, 'submissions', submissionId));
        if (!submissionDoc.exists()) {
          router.push('/dashboard/student');
          return;
        }
        setSubmission(submissionDoc.data());
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, submissionId, router]);

  if (loading) return <div>Loading...</div>;
  if (!quiz || !submission) return <div>Not found</div>;

  return (
    <div className="min-h-screen bg-[#111113] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#09090B] rounded-xl shadow-lg p-8 space-y-6 border border-[#2ECC71]/20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2ECC71] mb-2">
            Quiz Submitted Successfully!
          </h1>
          <p className="text-gray-400">{quiz.title}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#111113] p-4 rounded-md border border-[#2ECC71]/20">
            <p className="text-gray-400">
              Submitted at: {submission.submittedAt.toDate().toLocaleString()}
            </p>
            {quiz.settings?.showResultsImmediately && (
              <p className="mt-2 text-[#2ECC71]">
                Your results will be available immediately
              </p>
            )}
          </div>

          <Link
            href="/dashboard/student"
            className="block w-full bg-[#2ECC71] text-black px-4 py-2 rounded-md hover:bg-[#2ECC71]/90 transition-colors text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}