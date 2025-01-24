import SubmissionSuccessClient from './SubmissionSuccessClient';

export default function SubmissionSuccessPage({ params }) {
  return <SubmissionSuccessClient quizId={params.quizId} submissionId={params.submissionId} />;
} 