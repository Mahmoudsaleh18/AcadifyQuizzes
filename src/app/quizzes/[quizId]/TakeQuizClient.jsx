'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function TakeQuizClient({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!quizId) {
        setLoading(false);
        return;
      }

      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (quizDoc.exists()) {
          const quizData = { id: quizDoc.id, ...quizDoc.data() };
          setQuiz(quizData);
          if (quizData.timeLimit > 0) {
            setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
          }
        }

        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('quizId', '==', quizId),
          where('studentId', '==', user.uid)
        );
        const submissionSnapshot = await getDocs(submissionsQuery);
        
        if (!submissionSnapshot.empty) {
          setHasSubmitted(true);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [quizId, router]);

  // Memoize handleSubmit to prevent recreating it on every render
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (hasSubmitted || isSubmitting) {
      return;
    }

    // Check if submission deadline has passed
    if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
      alert('The submission deadline for this quiz has passed.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;

      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers += question.points || 1;
        }
        totalPoints += question.points || 1;
      });

      const score = (correctAnswers / totalPoints) * 100;
      const passed = score >= quiz.passingScore;

      const submissionRef = await addDoc(collection(db, 'submissions'), {
        quizId,
        studentId: auth.currentUser.uid,
        answers,
        score,
        passed,
        submittedAt: new Date(),
        status: 'submitted'
      });

      setHasSubmitted(true);
      router.push(`/quizzes/${quizId}/submission/${submissionRef.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false);
    }
  }, [quiz, answers, hasSubmitted, isSubmitting, quizId, router]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-[#111113] p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#09090B] rounded-xl border border-[#2ECC71]/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Already <span className="text-[#2ECC71]">Submitted</span>
            </h2>
            <p className="text-gray-400 mb-6">
              You have already taken this quiz. You cannot submit it again.
            </p>
            <button
              onClick={() => router.push('/dashboard/student')}
              className="bg-[#2ECC71] text-black px-6 py-2 rounded-md hover:bg-[#2ECC71]/90 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="min-h-screen bg-[#111113] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {quiz.deadline && (
          <div className="fixed top-4 right-4 p-4 rounded-lg bg-[#09090B] border border-[#2ECC71]/20">
            <p className="text-gray-300">Submission Deadline:</p>
            <p className={`text-xl ${
              new Date() > new Date(quiz.deadline) ? 'text-red-400' : 'text-[#2ECC71]'
            }`}>
              {new Date(quiz.deadline).toLocaleString()}
            </p>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
          <p className="text-gray-400">{quiz.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={index} className="bg-[#09090B] p-6 rounded-xl border border-[#2ECC71]/20">
              <p className="text-white mb-4">{question.text}</p>

              {question.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center space-x-3 text-gray-300 hover:text-white cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optIndex}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [index]: parseInt(e.target.value)
                          }))
                        }
                        className="form-radio text-[#2ECC71] focus:ring-[#2ECC71] border-[#2ECC71]/20"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'true-false' && (
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={0}
                      checked={answers[index] === 0}
                      onChange={(e) => handleAnswerChange(index, parseInt(e.target.value))}
                      className="text-[#2ECC71] focus:ring-[#2ECC71] bg-[#111113] border-[#2ECC71]/20"
                    />
                    <span className="ml-2 text-gray-300">True</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={1}
                      checked={answers[index] === 1}
                      onChange={(e) => handleAnswerChange(index, parseInt(e.target.value))}
                      className="text-[#2ECC71] focus:ring-[#2ECC71] bg-[#111113] border-[#2ECC71]/20"
                    />
                    <span className="ml-2 text-gray-300">False</span>
                  </label>
                </div>
              )}

              {question.type === 'text' && (
                <div className="space-y-2">
                  <textarea
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-full p-3 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white 
                             focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                    rows="4"
                    placeholder="Type your answer here..."
                  />
                  <p className="text-sm text-gray-400">
                    Please provide a detailed answer to the question above.
                  </p>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2ECC71] text-black px-6 py-3 rounded-md hover:bg-[#2ECC71]/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
