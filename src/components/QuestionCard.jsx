import React from 'react';
import { Flag, Info } from 'lucide-react';
import OptionList from './QuestionTypes/OptionList';
import StatementGrid from './QuestionTypes/StatementGrid';

export default function QuestionCard({ question, index, total, answer, onChange, isFlagged, onFlag, isReview }) {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div>
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1 block uppercase tracking-wider">
                        {question.topic} • Question {index + 1} of {total}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold dark:text-white leading-snug">{question.questionText}</h2>
                    {question.instruction && (
                        <p className="mt-2 text-sm text-slate-500 flex items-center gap-1">
                            <Info size={14} /> {question.instruction}
                        </p>
                    )}
                </div>
                {!isReview && (
                    <button
                        onClick={onFlag}
                        className={`p-2 rounded-lg transition-colors flex flex-col items-center text-xs gap-1 min-w-[60px] ${isFlagged ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        <Flag size={20} className={isFlagged ? 'fill-current' : ''} />
                        {isFlagged ? 'Flagged' : 'Flag'}
                    </button>
                )}
            </div>

            {question.image && (
                <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-center p-2">
                    <img src={question.image} alt="Question figure" className="max-w-full max-h-[300px] object-contain rounded" />
                </div>
            )}

            <div className="mt-4">
                {(question.type === 'single' || question.type === 'boolean' || question.type === 'image-choice') && (
                    <OptionList
                        type="radio"
                        options={question.options}
                        value={answer}
                        onChange={onChange}
                        isReview={isReview}
                        correctAnswer={question.correctAnswer}
                    />
                )}
                {question.type === 'multi' && (
                    <OptionList
                        type="checkbox"
                        options={question.options}
                        value={answer || []}
                        onChange={onChange}
                        isReview={isReview}
                        correctAnswers={question.correctAnswers}
                    />
                )}
                {question.type === 'statement-grid' && (
                    <StatementGrid
                        statements={question.statements}
                        options={question.options}
                        value={answer || {}}
                        onChange={onChange}
                        isReview={isReview}
                    />
                )}
            </div>

            {isReview && question.explanation && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-sm border border-blue-100 dark:border-blue-800/50">
                    <h4 className="font-bold flex items-center gap-1 mb-1"><Info size={16} /> Explanation</h4>
                    <p>{question.explanation}</p>
                </div>
            )}
        </div>
    );
}
