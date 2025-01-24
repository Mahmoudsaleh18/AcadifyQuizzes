import TakeQuizClient from './TakeQuizClient';

export default function QuizPage({ params }) {
  return <TakeQuizClient quizId={params.quizId} />;
} 