export default function QuizPreview({ quiz, onEdit, onSubmit }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{quiz.title}</h2>
          <p className="text-gray-400">{quiz.description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-[#2ECC71]/10 text-[#2ECC71] rounded-md hover:bg-[#2ECC71]/20 transition-colors border border-[#2ECC71]/20"
          >
            Edit Quiz
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-[#2ECC71] text-black rounded-md hover:bg-[#2ECC71]/90 transition-colors"
          >
            Publish Quiz
          </button>
        </div>
      </div>

      {/* Quiz Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111113] p-4 rounded-lg border border-[#2ECC71]/20">
          <p className="text-gray-400 text-sm">Passing Score</p>
          <p className="text-white font-semibold">{quiz.passingScore}%</p>
        </div>
        <div className="bg-[#111113] p-4 rounded-lg border border-[#2ECC71]/20">
          <p className="text-gray-400 text-sm">Deadline</p>
          <p className="text-white font-semibold">
            {quiz.deadline ? new Date(quiz.deadline).toLocaleString() : 'No deadline'}
          </p>
        </div>
      </div>

      {/* Questions Preview */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">
          Questions ({quiz.questions.length})
        </h3>
        
        {quiz.questions.map((question, index) => (
          <div 
            key={index}
            className="bg-[#111113] p-6 rounded-lg border border-[#2ECC71]/20"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[#2ECC71] text-sm font-medium">
                Question {index + 1} • {question.points} {question.points === 1 ? 'point' : 'points'}
              </span>
              <span className="text-gray-400 text-sm">
                {question.type.replace('-', ' ')}
              </span>
            </div>
            
            <p className="text-white mb-4">{question.text}</p>

            {question.type === 'multiple-choice' && (
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <div 
                    key={optIndex}
                    className={`p-3 rounded-md border ${
                      optIndex === question.correctAnswer
                        ? 'border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71]'
                        : 'border-gray-700 text-gray-400'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}

            {question.type === 'true-false' && (
              <div className="space-y-2">
                <div className={`p-3 rounded-md border ${
                  question.correctAnswer === 0
                    ? 'border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71]'
                    : 'border-gray-700 text-gray-400'
                }`}>
                  True
                </div>
                <div className={`p-3 rounded-md border ${
                  question.correctAnswer === 1
                    ? 'border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71]'
                    : 'border-gray-700 text-gray-400'
                }`}>
                  False
                </div>
              </div>
            )}

            {question.type === 'text' && (
              <div className="p-3 rounded-md border border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71]">
                Correct Answer: {question.correctAnswer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settings Preview */}
      <div className="bg-[#111113] p-6 rounded-lg border border-[#2ECC71]/20">
        <h3 className="text-white font-semibold mb-4">Quiz Settings</h3>
        <div className="flex items-center space-x-2 text-gray-400">
          <svg
            className={`w-5 h-5 ${quiz.settings.randomizeQuestions ? 'text-[#2ECC71]' : 'text-gray-500'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Randomize Questions</span>
        </div>
      </div>
    </div>
  );
}