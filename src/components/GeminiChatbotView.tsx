import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Code, 
  Terminal, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  HelpCircle,
  Lightbulb,
  ArrowDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  modelUsed?: string;
  timestamp: string;
}

const ROLE_PRESETS = [
  {
    id: 'architect',
    name: 'Senior AI Architect',
    description: 'Specializes in distributed LLM architectures, MCP protocols, latency tradeoffs, and scale.',
    systemInstruction: 'You are a Senior AI Architect at a tier-1 tech firm. You provide deep architectural guidance, high-throughput system designs, Model Context Protocol (MCP) implementations, and clear production tradeoffs with structured markdown, diagrams (ASCII/mermaid), and clean code examples.',
  },
  {
    id: 'ml_engineer',
    name: 'ML & Fine-Tuning Lead',
    description: 'Expertise in Pure RL (DeepSeek-R1 style), synthetic datasets, vLLM/SGLang, and quantization.',
    systemInstruction: 'You are a Principal Machine Learning Engineer specializing in LLM post-training, synthetic data pipelines, continuous batching (vLLM/SGLang), quantization (FP8/AWQ), and reinforcement learning. Provide rigorous technical explanations with Python, PyTorch, and serving configs.',
  },
  {
    id: 'code_reviewer',
    name: 'Code Reviewer & Auditor',
    description: 'Audits AI integrations for hallucinations, prompt injections, concurrency bottlenecks, and typing.',
    systemInstruction: 'You are an elite Principal Security & Code Quality Auditor. Review code strictly for memory safety, token efficiency, prompt injection vulnerabilities, structured output verification, and TypeScript/Python type safety.',
  },
  {
    id: 'strategist',
    name: 'AI Product & Tech Strategist',
    description: 'Guides build vs buy decisions, enterprise AI adoption, developer velocity, and ROI calculations.',
    systemInstruction: 'You are an enterprise AI Product and Technology Strategist. Help engineering leaders and product managers evaluate build-vs-buy decisions, measure engineering velocity gains, project GPU inferencing costs, and plan strategic multi-quarter AI roadmaps.',
  },
];

const MODEL_OPTIONS = [
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    tag: 'Deep Reasoning',
    description: 'Complex architecture design, deep multi-hop reasoning, and edge-case code analysis.',
    color: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/30',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tag: 'Balanced & Fast',
    description: 'High-throughput, low latency, versatile model for daily engineering tasks.',
    color: 'from-indigo-500 to-cyan-500',
    border: 'border-indigo-500/30',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tag: 'Ultra Fast',
    description: 'Ultra-lightweight, rapid turnaround for quick snippets and brief technical lookups.',
    color: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/30',
  },
];

const PROMPT_SUGGESTIONS = [
  'How do I implement an Anthropic Model Context Protocol (MCP) server in TypeScript?',
  'Compare vLLM continuous batching vs SGLang RadixAttention for multi-turn chatbots.',
  'Design a hybrid GraphRAG architecture with Neo4j and vector search for financial docs.',
  'Show Python code to fine-tune a model using LoRA with Unsloth on a single 24GB GPU.',
];

export const GeminiChatbotView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello! I'm your NexusAI Technical Mentor. Whether you need system architecture design, Model Context Protocol integration, continuous batching benchmarks, or code reviews, I'm here to accelerate your career. How can I help you today?",
      modelUsed: 'gemini-3.8-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLE_PRESETS[0]);
  const [selectedModel, setSelectedModel] = useState('gemini-4-argon');
  const [customRoleInstruction, setCustomRoleInstruction] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm('Clear entire conversation history?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'model',
          content: `Conversation reset. Switched to ${selectedRole.name}. What shall we tackle next?`,
          modelUsed: selectedModel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleSubmit = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    // Prepare multi-turn contents format for API
    const formattedContents = newHistory.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const activeInstruction = isCustomRole && customRoleInstruction.trim()
      ? customRoleInstruction.trim()
      : selectedRole.systemInstruction;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedContents,
          model: selectedModel,
          systemInstruction: activeInstruction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text || '(Empty response received)',
        modelUsed: data.modelUsed || selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat request error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Error: ${err.message || 'Unable to connect to AI engine.'}\n\nPlease verify network connection or try switching to Gemini 3.8 Flash.`,
        modelUsed: 'system-error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                MULTI-TURN AI ARCHITECT & CHATBOT
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• Context-Preserving Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Nexus<span className="text-indigo-400">AI</span> Engineering Copilot
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Equipped with deep reasoning for technical professionals. Choose specialized engineering role presets, switch between Gemini 4 Argon, 3.8 Flash, and 3.1 Flash Lite, and audit production architectures.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-rose-300 hover:border-rose-500/30 hover:bg-rose-950/20 transition-all cursor-pointer"
              title="Reset conversation"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Configuration Row: Model Selector & Role Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          {/* Model Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Model Engine</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MODEL_OPTIONS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? `bg-indigo-950/60 border-indigo-500/60 shadow-md shadow-indigo-500/10`
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.tag}
                      </span>
                    </div>
                    <div className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {m.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Persona Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>Specialized Role Preset</span>
              </div>
              <button
                onClick={() => setIsCustomRole(!isCustomRole)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                {isCustomRole ? 'Use Presets' : 'Custom Prompt'}
              </button>
            </label>

            {!isCustomRole ? (
              <select
                value={selectedRole.id}
                onChange={(e) => {
                  const found = ROLE_PRESETS.find((r) => r.id === e.target.value);
                  if (found) setSelectedRole(found);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {ROLE_PRESETS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.description}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customRoleInstruction}
                onChange={(e) => setCustomRoleInstruction(e.target.value)}
                placeholder="E.g., You are a Rust Systems Programmer optimizing WebAssembly runtimes..."
                className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
              />
            )}
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {isCustomRole
                ? 'Custom role system instruction active for this conversation.'
                : selectedRole.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-2xl overflow-hidden">
        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/30">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 text-[10px]">
                    <span className="font-bold flex items-center space-x-1.5">
                      <span>{isUser ? 'You' : selectedRole.name}</span>
                      {msg.modelUsed && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px] border border-indigo-500/30">
                          {msg.modelUsed}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {msg.content}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-indigo-300 flex items-center space-x-3 shadow-md">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span>Synthesizing response with {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center space-x-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Suggested Technical Prompts for Working Professionals:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {PROMPT_SUGGESTIONS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(prompt)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-950/30 text-slate-300 text-[11px] transition-all cursor-pointer flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-indigo-500 transition-all p-2 flex flex-col">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${selectedRole.name} anything about architecture, code, or deployment... (Enter to send, Shift+Enter for newline)`}
                rows={2}
                disabled={isLoading}
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[10px] text-slate-500">
                <span className="flex items-center space-x-2">
                  <span>Engine: <strong className="text-slate-300">{selectedModel}</strong></span>
                  <span>•</span>
                  <span>Role: <strong className="text-indigo-400">{selectedRole.name}</strong></span>
                </span>
                <span>{inputText.length} chars</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="h-14 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all cursor-pointer active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4 mr-1.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
