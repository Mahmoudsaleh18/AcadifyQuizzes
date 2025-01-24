"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';

export default function EvaluateQuiz() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // Get quizzes created by this instructor
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('instructorId', '==', auth.currentUser.uid)
        );
        const quizDocs = await getDocs(quizzesQuery);
        const quizIds = quizDocs.docs.map(doc => doc.id);

        // Get submissions for these quizzes
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('quizId', 'in', quizIds)
        );
        const submissionDocs = await getDocs(submissionsQuery);
        
        setSubmissions(submissionDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleGrade = async (submissionId, grade, feedback) => {
    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        grade,
        feedback,
        status: 'graded',
        gradedAt: new Date()
      });
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, grade, feedback, status: 'graded' }
          : sub
      ));
    } catch (error) {
      console.error('Error grading submission:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Evaluate Submissions</h1>
      <div className="space-y-4">
        {submissions.map(submission => (
          <div key={submission.id} className="border p-4 rounded">
            <p>Student ID: {submission.studentId}</p>
            <p>Submitted: {submission.submittedAt.toDate().toLocaleString()}</p>
            <p>Status: {submission.status}</p>
            
            {submission.status !== 'graded' && (
              <div className="mt-4 space-y-2">
                <input
                  type="number"
                  placeholder="Grade"
                  className="p-2 border rounded"
                  onChange={(e) => {
                    const grade = parseInt(e.target.value);
                    handleGrade(submission.id, grade, submission.feedback || '');
                  }}
                />
                <textarea
                  placeholder="Feedback"
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    handleGrade(submission.id, submission.grade || 0, e.target.value);
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
