'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function EvaluateQuizClient({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        router.push('/login');
        return;
      }
      
      try {
        // Fetch quiz details
        const quizRef = doc(db, 'quizzes', quizId);
        const quizDoc = await getDoc(quizRef);
        if (!quizDoc.exists()) {
          router.push('/dashboard/instructor');
          return;
        }
        setQuiz({ id: quizId, ...quizDoc.data() });

        // Fetch submissions for this quiz
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('quizId', '==', quizId)
        );
        const submissionDocs = await getDocs(submissionsQuery);
        
        const submissionsWithStudents = await Promise.all(
          submissionDocs.docs.map(async (docSnapshot) => {
            const submission = { id: docSnapshot.id, ...docSnapshot.data() };
            const studentRef = doc(db, 'users', submission.studentId);
            const studentDoc = await getDoc(studentRef);
            return {
              ...submission,
              studentName: studentDoc.exists() ? studentDoc.data().name : 'Unknown Student'
            };
          })
        );
        
        setSubmissions(submissionsWithStudents);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, router]);

  const handleGradeSubmit = async (submissionId, grade, feedback) => {
    setSubmitting(true);
    try {
      const submissionRef = doc(db, 'submissions', submissionId);
      await updateDoc(submissionRef, {
        grade: parseInt(grade),
        feedback,
        status: 'graded',
        gradedAt: new Date()
      });
      
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { 
              ...sub, 
              grade: parseInt(grade), 
              feedback, 
              status: 'graded',
              gradedAt: new Date()
            }
          : sub
      ));

      alert('Grade submitted successfully');
    } catch (error) {
      console.error('Error submitting grade:', error);
      alert('Error submitting grade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="min-h-screen bg-[#111113] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">
          Evaluate <span className="text-[#2ECC71]">Submissions</span>
        </h1>

        <div className="space-y-6">
          {submissions.map(submission => (
            <div key={submission.id} className="bg-[#09090B] p-6 rounded-xl border border-[#2ECC71]/20">
              {/* Student Info Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white font-medium">{submission.studentName}</h3>
                  <p className="text-gray-400">
                    Submitted: {submission.submittedAt.toDate().toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  submission.status === 'graded' 
                    ? 'bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20' 
                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                }`}>
                  {submission.status}
                </span>
              </div>

              {/* Questions and Answers */}
              <div className="space-y-6 mb-6">
                {quiz.questions.map((question, index) => (
                  <div key={index} className="bg-[#111113] p-4 rounded-lg border border-[#2ECC71]/20">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-white">{question.text}</p>
                      <span className="text-sm text-gray-400">
                        {question.points} points
                      </span>
                    </div>

                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div 
                            key={optIndex}
                            className={`p-3 rounded-md ${
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
                            className={`p-3 rounded-md ${
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
                        <div className="p-3 rounded-md border border-gray-800 text-gray-300">
                          Student Answer: {submission.answers[index] || 'No answer'}
                        </div>
                        <div className="p-3 rounded-md bg-[#2ECC71]/5 border border-[#2ECC71]/20 text-[#2ECC71]">
                          Correct Answer: {question.correctAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Grading Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGradeSubmit(
                    submission.id, 
                    e.target.grade.value, 
                    e.target.feedback.value
                  );
                }} 
                className="space-y-4 border-t border-[#2ECC71]/20 pt-6"
              >
                <div>
                  <label className="block text-gray-300 mb-2">Grade</label>
                  <input
                    name="grade"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={submission.grade || ''}
                    className="w-full p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Feedback</label>
                  <textarea
                    name="feedback"
                    defaultValue={submission.feedback || ''}
                    className="w-full p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#2ECC71] text-black px-4 py-2 rounded-md hover:bg-[#2ECC71]/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Grade'}
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}