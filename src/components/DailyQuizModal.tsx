import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Zap, 
  HelpCircle, 
  ChevronRight,
  RotateCcw,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types';

interface DailyQuizModalProps {
  onClose: () => void;
  onQuizCompleted: (score: number) => void;
  streakDays: number;
}

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-mcp-1',
    question: 'Why does Anthropic\'s Model Context Protocol (MCP) use JSON-RPC 2.0 over stdio/SSE instead of embedding OpenAPI specs directly in system prompts?',
    options: [
      'To force all models to run exclusively in local web browsers without internet access',
      'To separate tool execution environments from prompt contexts, dynamically discover tools, and reduce token waste',
      'To convert all relational SQL tables into binary pickle files',
      'Because OpenAPI cannot represent JSON objects',
    ],
    correctIndex: 1,
    explanation: 'Embedding massive schemas directly into system prompts wastes thousands of context tokens on every turn. MCP decouples data sources into separate processes that negotiate capabilities dynamically via JSON-RPC 2.0.',
  },
  {
    id: 'q-rag-1',
    question: 'In production RAG systems, what is the main benefit of Contextual Retrieval (prepending document context to chunks)?',
    options: [
      'It reduces GPU memory usage during vector inference by 50%',
      'It solves the chunk boundary problem by ensuring isolated sentences retain situational antecedents and keywords',
      'It eliminates the need for vector databases entirely in favor of flat text files',
      'It automatically formats the output as HTML tables',
    ],
    correctIndex: 1,
    explanation: 'Chunks like "The company grew 35% in Q3" fail retrieval for "Acme Corp revenue" because company name was in chunk #1. Contextual Retrieval prepends document-level context to each chunk during indexing.',
  },
  {
    id: 'q-vllm-1',
    question: 'How does PagedAttention in vLLM prevent GPU VRAM fragmentation during high-throughput model serving?',
    options: [
      'By capping all incoming user prompts to exactly 128 tokens',
      'By allocating KV-cache into small non-contiguous memory blocks like virtual memory in operating systems',
      'By quantizing models to 1-bit weights',
      'By discarding historical conversation turns after 3 seconds',
    ],
    correctIndex: 1,
    explanation: 'Standard PyTorch pre-reserves memory for max_tokens upfront, wasting 60-80% of VRAM. PagedAttention allocates blocks dynamically in 16-token chunks and shares common prefix blocks across requests.',
  },
];

export const DailyQuizModal: React.FC<DailyQuizModalProps> = ({
  onClose,
  onQuizCompleted,
  streakDays,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(DEFAULT_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      onQuizCompleted(score + (selectedOption === currentQ.correctIndex ? 1 : 0));
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col relative my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Daily 3-Minute AI Workout
              </h2>
              <p className="text-xs text-slate-400">
                Keep your technical edge razor sharp • Streak: {streakDays} Days
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isFinished ? (
          <div className="p-6 space-y-6">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-indigo-400 font-bold">Score: {score}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                let optionStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

                if (selectedOption === idx) {
                  optionStyle = 'bg-indigo-950/50 border-indigo-500 text-white shadow-sm';
                }

                if (isAnswerSubmitted) {
                  if (idx === currentQ.correctIndex) {
                    optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (selectedOption === idx && idx !== currentQ.correctIndex) {
                    optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                  } else {
                    optionStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Box when submitted */}
            {isAnswerSubmitted && (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                selectedOption === currentQ.correctIndex
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              }`}>
                <div className="flex items-center space-x-1.5 font-bold">
                  {selectedOption === currentQ.correctIndex ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>Not quite. Key Concept:</span>
                    </>
                  )}
                </div>
                <p className="text-slate-300">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex justify-end">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-40 cursor-pointer"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <span>{currentIndex + 1 === questions.length ? 'Finish Workout' : 'Next Question'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Finished State */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-500 p-0.5 mx-auto shadow-xl shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                Daily Workout Completed!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You scored <span className="font-bold text-white">{score} / {questions.length}</span>
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-around text-xs">
              <div>
                <span className="text-slate-500 block">Streak</span>
                <span className="text-orange-400 font-extrabold text-base flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-current mr-1" />
                  {streakDays} Days
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <span className="text-slate-500 block">XP Earned</span>
                <span className="text-indigo-400 font-extrabold text-base flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-current mr-1" />
                  +60 XP
                </span>
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={handleRestart}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Workout</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
