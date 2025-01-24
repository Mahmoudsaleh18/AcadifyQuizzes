import { Suspense } from 'react';
import QuizSuccessClient from './QuizSuccessClient';

export default function QuizSuccessPage({ params }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizSuccessClient quizId={params.quizId} />
    </Suspense>
  );
} 
 