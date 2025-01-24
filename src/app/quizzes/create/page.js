'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import QuizPreview from '@/components/QuizPreview';

export default function CreateQuiz() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('details'); // details, questions, preview
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [],
    passingScore: 60,
    deadline: '',
    settings: {
      randomizeQuestions: false
    }
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'multiple-choice',
    points: 1,
    options: [''],
    correctAnswer: 0,
    textAnswer: ''
  });

  const addQuestion = () => {
    if (!currentQuestion.text || 
        (currentQuestion.type === 'multiple-choice' && 
         currentQuestion.options.some(opt => !opt))) {
      alert('Please fill all question fields');
      return;
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, currentQuestion]
    }));
    setCurrentQuestion({
      text: '',
      type: 'multiple-choice',
      points: 1,
      options: [''],
      correctAnswer: 0,
      textAnswer: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (quizData.questions.length === 0) {
        alert('Please add at least one question');
        return;
      }

      // Clean up the quiz data before submission
      const cleanQuizData = {
        title: quizData.title || '',
        description: quizData.description || '',
        questions: quizData.questions.map(question => ({
          text: question.text || '',
          type: question.type || 'multiple-choice',
          points: question.points || 1,
          options: question.type === 'multiple-choice' ? (question.options || []) : [],
          correctAnswer: question.correctAnswer ?? 0,
          textAnswer: question.type === 'text' ? (question.textAnswer || '') : null
        })),
        passingScore: quizData.passingScore || 60,
        deadline: quizData.deadline || null,
        settings: {
          randomizeQuestions: Boolean(quizData.settings?.randomizeQuestions)
        },
        instructorId: auth.currentUser.uid,
        createdAt: new Date(),
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'quizzes'), cleanQuizData);
      router.push(`/quizzes/${docRef.id}/success`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz');
    }
  };

  const handleQuestionTypeChange = (e) => {
    const newType = e.target.value;
    setCurrentQuestion({
      ...currentQuestion,
      type: newType,
      options: newType === 'multiple-choice' ? [''] : [],
      correctAnswer: newType === 'true-false' ? 0 : '',
      textAnswer: newType === 'text' ? '' : undefined
    });
  };

  return (
    <div className="min-h-screen bg-[#111113] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-white text-center md:text-left">
            Create New <span className="text-[#2ECC71]">Quiz</span>
          </h1>
          <div className="flex justify-center md:justify-end gap-2">
            {['details', 'questions', 'preview'].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentStep === step 
                    ? 'bg-[#2ECC71] text-black' 
                    : 'bg-[#09090B] text-gray-300 hover:bg-[#2ECC71]/10 hover:text-[#2ECC71] border border-[#2ECC71]/20'
                }`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {currentStep === 'details' && (
          <div className="space-y-6 bg-[#09090B] p-6 rounded-xl border border-[#2ECC71]/20">
            <div>
              <label className="block mb-2 text-gray-300">Quiz Title</label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                className="w-full p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-300">Description</label>
              <textarea
                value={quizData.description}
                onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                className="w-full p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-gray-300">Submission Deadline</label>
                <input
                  type="datetime-local"
                  value={quizData.deadline || ''}
                  onChange={(e) => setQuizData({...quizData, deadline: e.target.value})}
                  className="w-full p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-300">Passing Score (%)</label>
                <input
                  type="number"
                  value={quizData.passingScore}
                  onChange={(e) => setQuizData({...quizData, passingScore: parseInt(e.target.value)})}
                  className="w-full p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-white">Quiz Settings</h3>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={quizData.settings.randomizeQuestions}
                    onChange={(e) => setQuizData({
                      ...quizData,
                      settings: {
                        ...quizData.settings,
                        randomizeQuestions: e.target.checked
                      }
                    })}
                    className="form-checkbox text-[#2ECC71] border-[#2ECC71]/20"
                  />
                  <span>Randomize Questions</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'questions' && (
          <div className="space-y-6">
            {/* Current Question Editor */}
            <div className="bg-[#09090B] p-6 rounded-xl border border-[#2ECC71]/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Add Question</h2>
                <select
                  value={currentQuestion.type}
                  onChange={handleQuestionTypeChange}
                  className="p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="text">Text Answer</option>
                  <option value="true-false">True/False</option>
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Question Text</label>
                  <textarea
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion,
                      text: e.target.value
                    })}
                    className="w-full p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Points</label>
                  <input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion,
                      points: parseInt(e.target.value)
                    })}
                    className="w-full p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                    min="1"
                    required
                  />
                </div>

                {currentQuestion.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    <label className="block mb-2">Options</label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: index
                          })}
                          className="mt-3"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion({
                              ...currentQuestion,
                              options: newOptions
                            });
                          }}
                          className="flex-1 p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {index === currentQuestion.options.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentQuestion({
                              ...currentQuestion,
                              options: [...currentQuestion.options, '']
                            })}
                            className="px-3 py-2 bg-transparent rounded hover:border-primary-dark hover:border"
                          >
                            +
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = currentQuestion.options.filter((_, i) => i !== index);
                              setCurrentQuestion({
                                ...currentQuestion,
                                options: newOptions,
                                correctAnswer: currentQuestion.correctAnswer > index 
                                  ? currentQuestion.correctAnswer - 1 
                                  : currentQuestion.correctAnswer
                              });
                            }}
                            className="px-3 py-2 bg-transparent rounded hover:border-primary-dark hover:border"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'true-false' && (
                  <div className="space-y-2">
                    <label className="block mb-2">Correct Answer</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={currentQuestion.correctAnswer === 0}
                          onChange={() => setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: 0
                          })}
                          className="mr-2"
                        />
                        True
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={currentQuestion.correctAnswer === 1}
                          onChange={() => setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: 1
                          })}
                          className="mr-2"
                        />
                        False
                      </label>
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <div className="space-y-2">
                    <label className="block mb-2 text-gray-300">Sample Answer</label>
                    <textarea
                      value={currentQuestion.textAnswer}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion,
                        textAnswer: e.target.value
                      })}
                      className="w-full p-2 bg-[#111113] border border-[#2ECC71]/20 rounded-md text-white focus:border-[#2ECC71] focus:ring-[#2ECC71] transition-colors"
                      rows="3"
                      placeholder="Enter a sample answer for grading reference"
                    />
                    <p className="text-sm text-gray-400">
                      This will be used as a reference for grading. Students will see an empty text area to submit their answer.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-[#2ECC71] text-black px-4 py-2 rounded-md hover:bg-[#2ECC71]/90 transition-colors"
                >
                  Add Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            {quizData.questions.length > 0 && (
              <div className="bg-[#09090B] p-6 rounded-xl border border-[#2ECC71]/20">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Questions ({quizData.questions.length})
                </h2>
                <div className="space-y-4">
                  {quizData.questions.map((question, index) => (
                    <div key={index} className="border border-[#2ECC71]/20 p-4 rounded-md bg-[#111113]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{question.text}</p>
                          <p className="text-sm text-gray-400">
                            {question.type} • {question.points} points
                          </p>
                          {question.type === 'text' && (
                            <p className="text-sm text-gray-400 mt-2">
                              Sample Answer: {question.textAnswer}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const newQuestions = quizData.questions.filter((_, i) => i !== index);
                            setQuizData({...quizData, questions: newQuestions});
                          }}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="bg-[#09090B] p-6 rounded-xl border border-[#2ECC71]/20">
            <QuizPreview 
              quiz={quizData} 
              onEdit={() => setCurrentStep('questions')}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
} 