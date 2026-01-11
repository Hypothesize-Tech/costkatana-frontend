import React from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface ClarifyingQuestionsViewProps {
    questions: string[];
    answers: Record<string, string>;
    onAnswerChange: (question: string, answer: string) => void;
    onSubmit: () => void;
    submitting?: boolean;
}

export const ClarifyingQuestionsView: React.FC<ClarifyingQuestionsViewProps> = ({
    questions,
    answers,
    onAnswerChange,
    onSubmit,
    submitting = false
}) => {
    const allAnswered = questions.every(q => answers[q] && answers[q].trim().length > 0);

    return (
        <div className="p-6 space-y-6">
            <div className="rounded-xl border border-primary-200/30 dark:border-primary-700/30 p-6 bg-primary-50/50 dark:bg-primary-900/20 backdrop-blur-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                            Clarifying Questions
                        </h3>
                        <p className="text-sm text-primary-800 dark:text-primary-200">
                            Before I create a plan, I need some clarifications to ensure I understand your requirements correctly.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {questions.map((question, index) => (
                        <div key={index} className="space-y-2">
                            <label className="block text-sm font-medium text-secondary-900 dark:text-secondary-100">
                                <span className="text-primary-600 dark:text-primary-400 font-semibold">Q{index + 1}:</span> {question}
                            </label>
                            <textarea
                                value={answers[question] || ''}
                                onChange={(e) => onAnswerChange(question, e.target.value)}
                                placeholder="Your answer..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-dark-card text-secondary-900 dark:text-white placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onSubmit}
                        disabled={!allAnswered || submitting}
                        className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${allAnswered && !submitting
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl'
                            : 'bg-secondary-300 dark:bg-secondary-700 cursor-not-allowed'
                            }`}
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            'Submit Answers & Continue'
                        )}
                    </button>
                </div>

                {!allAnswered && (
                    <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-3 text-right">
                        Please answer all questions to continue
                    </p>
                )}
            </div>
        </div>
    );
};
