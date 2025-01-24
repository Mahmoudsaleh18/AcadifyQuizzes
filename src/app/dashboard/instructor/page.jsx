'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs,getDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, CheckCircle, Users, GraduationCap } from 'lucide-react';

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

export default function InstructorDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'instructor') {
          router.push('/dashboard/student');
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking role:', error);
        router.push('/login');
      }
    };

    checkAccess();
  }, [router]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const q = query(
          collection(db, 'quizzes'),
          where('instructorId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const quizData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setQuizzes(quizData);

        const quizIds = quizData.map(quiz => quiz.id);
        if (quizIds.length > 0) {
          const submissionsQuery = query(
            collection(db, 'submissions'),
            where('quizId', 'in', quizIds)
          );
          const submissionSnapshot = await getDocs(submissionsQuery);
          setTotalSubmissions(submissionSnapshot.size);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const copyQuizLink = (quizId) => {
    const link = `${window.location.origin}/quizzes/${quizId}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(`Link copied for Quiz ${quizId}`);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        // Delete the quiz document
        await deleteDoc(doc(db, 'quizzes', quizId));
        
        // Update the local state to remove the deleted quiz
        setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
        
        // Update total submissions count
        const remainingQuizIds = quizzes
          .filter(quiz => quiz.id !== quizId)
          .map(quiz => quiz.id);
          
        if (remainingQuizIds.length > 0) {
          const submissionsQuery = query(
            collection(db, 'submissions'),
            where('quizId', 'in', remainingQuizIds)
          );
          const submissionSnapshot = await getDocs(submissionsQuery);
          setTotalSubmissions(submissionSnapshot.size);
        } else {
          setTotalSubmissions(0);
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz');
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#111113] p-8">
      <div className="max-w-7xl mx-auto">
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111113] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Hello, <span className="text-[#2ECC71]">Instructor</span>
          </h1>
          <p className="text-gray-400">Welcome to your dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Total Quizzes" 
            count={quizzes.length}
            icon={BookOpen}
          />
          <StatsCard 
            title="Active Quizzes" 
            count={quizzes.filter(q => !q.archived).length}
            icon={CheckCircle}
          />
          <StatsCard 
            title="Total Submissions" 
            count={totalSubmissions}
            icon={Users}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Your <span className="text-[#2ECC71]">Quizzes</span></h2>
            <Link 
              href="/quizzes/create" 
              className="bg-[#2ECC71] text-black px-4 py-2 rounded-md hover:bg-[#2ECC71]/90 transition-colors"
            >
              Create New Quiz
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-[#09090B] rounded-xl border border-[#2ECC71]/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-2">{quiz.title}</h2>
                <p className="text-gray-400 mb-4">{quiz.description}</p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => copyQuizLink(quiz.id)}
                    className="w-full bg-[#2ECC71]/10 text-[#2ECC71] px-4 py-2 rounded-md hover:bg-[#2ECC71]/20 transition-colors border border-[#2ECC71]/20"
                  >
                    Share Quiz Link
                  </button>
                  
                  <Link 
                    href={`/quizzes/evaluate/${quiz.id}`}
                    className="block w-full bg-[#2ECC71] text-black px-4 py-2 rounded-md text-center hover:bg-[#2ECC71]/90 transition-colors"
                  >
                    View Submissions
                  </Link>

                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="w-full bg-red-500/10 text-red-500 px-4 py-2 rounded-md hover:bg-red-500/20 transition-colors border border-red-500/20"
                  >
                    Delete Quiz
                  </button>
                </div>
              </div>
            ))}

            {quizzes.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400">
                No quizzes created yet. Click "Create New Quiz" to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
