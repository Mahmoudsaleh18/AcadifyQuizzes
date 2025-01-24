'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, CheckCircle, Users } from 'lucide-react';

const StatsCard = ({ title, count, icon: Icon }) => (
  <div className="bg-[#09090B] p-6 rounded-xl shadow-lg border border-[#2ECC71]/20 relative overflow-hidden">
    <div className="absolute inset-0 bg-[#2ECC71]/5"></div>
    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-[#2ECC71] text-sm font-medium mb-1">{title}</p>
        <h3 className="text-white text-2xl font-bold">{count}</h3>
      </div>
      <div className="bg-[#2ECC71]/10 p-3 rounded-lg border border-[#2ECC71]/20">
        <Icon className="text-[#2ECC71]" size={24} />
      </div>
    </div>
    <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-[#2ECC71]/0 to-[#2ECC71]/10 rounded-tl-full"></div>
  </div>
);

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'student') {
          router.push('/dashboard/instructor');
          return;
        }

        const q = query(
          collection(db, 'submissions'),
          where('studentId', '==', user.uid)
        );
        
        const submissionDocs = await getDocs(q);
        const submissionData = await Promise.all(
          submissionDocs.docs.map(async (docSnapshot) => {
            const submission = { id: docSnapshot.id, ...docSnapshot.data() };
            const quizRef = doc(db, 'quizzes', submission.quizId);
            const quizDoc = await getDoc(quizRef);
            const quizData = quizDoc.data();

            // Handle case where quiz doesn't exist or is deleted
            if (!quizData) {
              return {
                ...submission,
                quiz: {
                  id: submission.quizId,
                  title: 'Deleted Quiz',
                  instructorName: 'Unknown Instructor',
                  questions: [] // Add empty questions array for safety
                }
              };
            }

            try {
              // Fetch instructor data
              const instructorRef = doc(db, 'users', quizData.instructorId);
              const instructorDoc = await getDoc(instructorRef);
              const instructorData = instructorDoc.data();

              return {
                ...submission,
                quiz: {
                  id: quizDoc.id,
                  ...quizData,
                  instructorName: instructorData?.name || 'Unknown Instructor'
                }
              };
            } catch (error) {
              console.error('Error fetching instructor:', error);
              return {
                ...submission,
                quiz: {
                  id: quizDoc.id,
                  ...quizData,
                  instructorName: 'Unknown Instructor'
                }
              };
            }
          })
        );
        
        setSubmissions(submissionData);
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111113] p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalQuizzes: submissions.length,
    completedQuizzes: submissions.filter(s => s.status === 'graded').length,
    averageScore: submissions.filter(s => s.status === 'graded').reduce((acc, curr) => acc + curr.grade, 0) / submissions.filter(s => s.status === 'graded').length || 0,
    pendingGrades: submissions.filter(s => s.status !== 'graded').length
  };

  return (
    <div className="min-h-screen bg-[#111113] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-white">
            My <span className="text-[#2ECC71]">Progress</span>
          </h1>
          <p className="text-gray-400">Track your quiz submissions and grades</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Quizzes" count={stats.totalQuizzes} icon={BookOpen} />
          <StatsCard title="Completed" count={stats.completedQuizzes} icon={CheckCircle} />
          <StatsCard title="Average Score" count={`${Math.round(stats.averageScore)}%`} icon={Users} />
          <StatsCard title="Pending Grades" count={stats.pendingGrades} icon={Calendar} />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Recent Submissions</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {submissions.map((submission) => (
              <div 
                key={submission.id} 
                className="bg-[#09090B] rounded-xl border border-[#2ECC71]/20 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {submission.quiz.title}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mb-1">
                    Created by: {submission.quiz.instructorName}
                  </p>
                  
                  <p className="text-sm text-gray-400 mb-4">
                    Submitted: {submission.submittedAt.toDate().toLocaleString()}
                  </p>
                  
                  <div className={`rounded-lg p-4 ${
                    submission.status === 'graded'
                      ? 'bg-[#2ECC71]/10 border border-[#2ECC71]/20'
                      : 'bg-yellow-500/10 border border-yellow-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        submission.status === 'graded' 
                          ? 'text-[#2ECC71]' 
                          : 'text-yellow-500'
                      }`}>
                        {submission.status === 'graded' ? 'Graded' : 'Pending Grade'}
                      </span>
                      {submission.status === 'graded' && (
                        <span className="text-[#2ECC71] font-bold">
                          {submission.grade}/100
                        </span>
                      )}
                    </div>
                    
                    {submission.status === 'graded' && submission.feedback && (
                      <div className="mt-3 pt-3 border-t border-[#2ECC71]/20">
                        <p className="text-gray-400 text-sm">Instructor Feedback:</p>
                        <p className="mt-1 text-white text-sm">{submission.feedback}</p>
                      </div>
                    )}

                    {submission.status === 'graded' && (
                      <div className="mt-4 pt-4 border-t border-[#2ECC71]/20">
                        <p className="text-gray-400 text-sm mb-3">Question Review:</p>
                        <div className="space-y-4">
                          {submission.quiz.questions?.map((question, index) => (
                            <div key={index} className="bg-[#111113] p-3 rounded-lg">
                              <p className="text-white text-sm mb-2">{question.text}</p>

                              {question.type === 'multiple-choice' && question.options && (
                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div 
                                      key={optIndex}
                                      className={`p-2 rounded-md text-sm ${
                                        optIndex === question.correctAnswer && optIndex === submission.answers[index]
                                          ? 'bg-[#2ECC71]/10 border border-[#2ECC71] text-[#2ECC71]'
                                          : optIndex === question.correctAnswer
                                          ? 'bg-[#2ECC71]/5 border border-[#2ECC71]/20 text-[#2ECC71]'
                                          : optIndex === submission.answers[index]
                                          ? 'bg-red-500/5 border border-red-500/20 text-red-400'
                                          : 'border border-gray-800 text-gray-400'
                                      }`}
                                    >
                                      {option}
                                      {optIndex === question.correctAnswer && (
                                        <span className="ml-2 text-[#2ECC71]">✓</span>
                                      )}
                                      {optIndex === submission.answers[index] && optIndex !== question.correctAnswer && (
                                        <span className="ml-2 text-red-400">✗</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {question.type === 'true-false' && (
                                <div className="space-y-2">
                                  {['True', 'False'].map((option, optIndex) => (
                                    <div 
                                      key={optIndex}
                                      className={`p-2 rounded-md text-sm ${
                                        optIndex === question.correctAnswer && optIndex === submission.answers[index]
                                          ? 'bg-[#2ECC71]/10 border border-[#2ECC71] text-[#2ECC71]'
                                          : optIndex === question.correctAnswer
                                          ? 'bg-[#2ECC71]/5 border border-[#2ECC71]/20 text-[#2ECC71]'
                                          : optIndex === submission.answers[index]
                                          ? 'bg-red-500/5 border border-red-500/20 text-red-400'
                                          : 'border border-gray-800 text-gray-400'
                                      }`}
                                    >
                                      {option}
                                      {optIndex === question.correctAnswer && (
                                        <span className="ml-2 text-[#2ECC71]">✓</span>
                                      )}
                                      {optIndex === submission.answers[index] && optIndex !== question.correctAnswer && (
                                        <span className="ml-2 text-red-400">✗</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {question.type === 'text' && (
                                <div className="space-y-2">
                                  <div className="p-2 rounded-md border border-gray-800 text-gray-300 text-sm">
                                    Your Answer: {submission.answers[index] || 'No answer'}
                                  </div>
                                  <div className="p-2 rounded-md bg-[#2ECC71]/5 border border-[#2ECC71]/20 text-[#2ECC71] text-sm">
                                    Correct Answer: {question.correctAnswer}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400">
                You haven't taken any quizzes yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
