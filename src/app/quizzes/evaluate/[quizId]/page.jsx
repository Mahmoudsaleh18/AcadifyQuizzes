import EvaluateQuizClient from './EvaluateQuizClient';

export default function EvaluateQuizPage({ params }) {
  return <EvaluateQuizClient quizId={params.quizId} />;
} 