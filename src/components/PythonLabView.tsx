import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Copy, 
  Check, 
  Sparkles,
  BookOpen,
  Code2,
  AlertCircle
} from 'lucide-react';

interface PythonLabViewProps {
  onGainXp: (amount: number, reason: string) => void;
}

interface PythonTemplate {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  code: string;
}

const PYTHON_TEMPLATES: PythonTemplate[] = [
  {
    id: 'rag-rrf',
    title: 'Hybrid RAG & Reciprocal Rank Fusion (RRF)',
    category: 'RAG & Retrieval',
    difficulty: 'Intermediate',
    description: 'Implement sparse BM25 lexical search combined with dense vector semantic rankings using Reciprocal Rank Fusion.',
    code: `import math
from collections import Counter

documents = [
    {"id": "doc1", "text": "Anthropic Model Context Protocol (MCP) standardizes AI tool interfaces over stdio and SSE."},
    {"id": "doc2", "text": "vLLM with PagedAttention reduces KV-cache memory waste and enables high continuous batching throughput."},
    {"id": "doc3", "text": "Contextual Retrieval prepends document context to chunks, slashing RAG hallucinations by 65%."},
    {"id": "doc4", "text": "DeepSeek-R1 uses Large-Scale Reinforcement Learning for mathematical and code reasoning distillation."},
]

def tokenize(text: str):
    return [w.strip(".,!?:;()[]").lower() for w in text.split() if w]

def calculate_rrf(query: str, docs: list, k: int = 60):
    q_tokens = tokenize(query)
    doc_tokens = [tokenize(d["text"]) for d in docs]
    
    # 1. Lexical BM25 Scoring
    bm25_scores = []
    for i, tokens in enumerate(doc_tokens):
        matches = sum(1 for t in q_tokens if t in tokens)
        score = matches / (len(tokens) + 1)
        bm25_scores.append((docs[i]["id"], score))
    bm25_ranked = sorted(bm25_scores, key=lambda x: x[1], reverse=True)
    
    # 2. Simulated Semantic Vector Scoring
    vector_scores = []
    for d in docs:
        semantic_boost = 0.9 if any(term in query.lower() for term in ["hallucination", "rag", "retrieval"]) and "RAG" in d["text"] else 0.2
        vector_scores.append((d["id"], semantic_boost))
    vector_ranked = sorted(vector_scores, key=lambda x: x[1], reverse=True)
    
    # 3. Reciprocal Rank Fusion
    rrf_fused = {}
    for rank, (doc_id, _) in enumerate(bm25_ranked):
        rrf_fused[doc_id] = rrf_fused.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
    for rank, (doc_id, _) in enumerate(vector_ranked):
        rrf_fused[doc_id] = rrf_fused.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
        
    return sorted(rrf_fused.items(), key=lambda x: x[1], reverse=True)

query = "How to prevent hallucinations in RAG retrieval?"
print(f"Query: '{query}'\\n" + "="*50)
results = calculate_rrf(query, documents)

for rank, (doc_id, score) in enumerate(results, 1):
    doc_content = next(d["text"] for d in documents if d["id"] == doc_id)
    print(f"Rank {rank}: [Score: {score:.5f}] {doc_id}")
    print(f"       -> {doc_content}\\n")
`,
  },
  {
    id: 'kv-cache-calculator',
    title: 'LLM KV-Cache & VRAM Sizer in Python',
    category: 'LLM Infrastructure',
    difficulty: 'Advanced',
    description: 'Calculate exact GPU VRAM needed for weights, KV-cache, and activations across FP16 vs FP8 quantization.',
    code: `def calculate_vram_requirements(
    params_billions: float,
    context_tokens: int,
    batch_size: int,
    layers: int,
    hidden_dim: int,
    precision: str = "fp8"
):
    """Calculates model weights and KV-cache GPU memory budgets."""
    bytes_per_param = 1.0 if precision == "fp8" else 2.0 if precision == "fp16" else 0.5
    
    # 1. Model Weights VRAM (in GB)
    model_weights_gb = (params_billions * 1e9 * bytes_per_param) / (1024**3)
    
    # 2. KV Cache VRAM per token = 2 * layers * hidden_dim * bytes_per_elem
    # Factor 2 accounts for Key and Value matrices
    bytes_per_elem = 1.0 if precision == "fp8" else 2.0
    kv_cache_per_token_bytes = 2 * layers * hidden_dim * bytes_per_elem
    total_kv_cache_gb = (batch_size * context_tokens * kv_cache_per_token_bytes) / (1024**3)
    
    # 3. Activation Overhead (~20% headroom recommended)
    total_needed_gb = (model_weights_gb + total_kv_cache_gb) * 1.20
    
    return {
        "model_weights_gb": round(model_weights_gb, 2),
        "kv_cache_gb": round(total_kv_cache_gb, 2),
        "recommended_vram_gb": round(total_needed_gb, 2)
    }

print("=== LLM INFRASTRUCTURE SIZING (Qwen-2.5-Coder-14B) ===")
# Sizing 14B model with 16k context window and concurrent batch size 8
specs = [("fp16", "NVIDIA A100 (80GB)"), ("fp8", "NVIDIA L40S (48GB)")]

for prec, gpu in specs:
    res = calculate_vram_requirements(
        params_billions=14.7,
        context_tokens=16384,
        batch_size=8,
        layers=48,
        hidden_dim=5120,
        precision=prec
    )
    print(f"\\nPrecision: {prec.upper()} on {gpu}")
    print(f"  • Model Weights : {res['model_weights_gb']} GB")
    print(f"  • Dynamic KV-Cache: {res['kv_cache_gb']} GB")
    print(f"  • Total VRAM Goal: {res['recommended_vram_gb']} GB")
`,
  },
  {
    id: 'mcp-tool-definition',
    title: 'Model Context Protocol (MCP) Tool & Schema Validator',
    category: 'Agents & Protocols',
    difficulty: 'Intermediate',
    description: 'Build a standard MCP tool schema and test execution with strict SQL query sandboxing and execution guardrails.',
    code: `import json
import re

class FastMCPServer:
    def __init__(self, name: str):
        self.name = name
        self.tools = {}

    def register_tool(self, name: str, description: str, schema: dict, handler):
        self.tools[name] = {
            "name": name,
            "description": description,
            "inputSchema": schema,
            "handler": handler
        }

    def list_tools(self):
        return [
            {"name": t["name"], "description": t["description"], "inputSchema": t["inputSchema"]}
            for t in self.tools.values()
        ]

    def call_tool(self, tool_name: str, arguments: dict):
        if tool_name not in self.tools:
            return {"error": f"Tool '{tool_name}' not found on server"}
        return self.tools[tool_name]["handler"](arguments)

# Instantiate MCP Server
server = FastMCPServer("Security-Audit-MCP")

# Define Tool Handler with Guardrails
def safe_sql_query(args: dict):
    query = args.get("sql", "").strip()
    # Enforce read-only constraint
    forbidden = ["insert", "update", "delete", "drop", "alter", "truncate"]
    if any(re.search(rf"\\b{w}\\b", query, re.IGNORECASE) for w in forbidden):
        return {"status": "rejected", "reason": "Destructive queries strictly disallowed in MCP read replica."}
    
    # Mock data return
    return {
        "status": "success",
        "rows_returned": 2,
        "data": [
            {"id": 101, "agent_name": "ReviewerAgent", "status": "healthy", "latency_ms": 142},
            {"id": 102, "agent_name": "Synthesizer", "status": "healthy", "latency_ms": 320}
        ]
    }

server.register_tool(
    name="query_agent_telemetry",
    description="Query agent performance telemetry safely using SQL",
    schema={
        "type": "object",
        "properties": {"sql": {"type": "string", "description": "SELECT query only"}},
        "required": ["sql"]
    },
    handler=safe_sql_query
)

print("=== REGISTERED MCP TOOLS ===")
print(json.dumps(server.list_tools(), indent=2))

print("\\n=== EXECUTING VALID MCP TOOL CALL ===")
res1 = server.call_tool("query_agent_telemetry", {"sql": "SELECT * FROM agent_telemetry LIMIT 5;"})
print(json.dumps(res1, indent=2))

print("\\n=== EXECUTING BLOCKED TOOL CALL (Guardrail Triggered) ===")
res2 = server.call_tool("query_agent_telemetry", {"sql": "DROP TABLE agent_telemetry;"})
print(json.dumps(res2, indent=2))
`,
  },
  {
    id: 'reasoning-trace',
    title: 'Self-Verification & Reasoning Loop in Python',
    category: 'Reasoning Models',
    difficulty: 'Intermediate',
    description: 'Deconstruct how reasoning models (DeepSeek-R1 / o3) generate thought chains, backtrack on errors, and output verified code.',
    code: `import time

class ReasoningEngine:
    def solve_with_reflection(self, problem: str):
        print(f"Problem: {problem}\\n")
        print("<think>")
        
        # Step 1: Initial hypothesis
        print("1. Formulating initial architectural approach...")
        time.sleep(0.05)
        print("   Hypothesis: Store user embeddings directly in Redis strings.")
        
        # Step 2: Critical Self-Verification (Backtracking)
        print("2. Verifying constraints and performance bounds...")
        time.sleep(0.05)
        print("   [Critique]: Redis strings lack cosine distance vector indexing.")
        print("   [Backtracking]: Switch to Redis VSS (Vector Similarity Search) or LanceDB.")
        
        # Step 3: Synthesis
        print("3. Validating optimal cost and latency trade-off...")
        print("   Conclusion: LanceDB allows serverless disk-based indexing without RAM cost blowup.")
        print("</think>\\n")
        
        return {
            "final_architecture": "LanceDB with Contextual Chunking + BGE-Reranker-v2",
            "confidence": 0.96,
            "latency_estimate": "38ms"
        }

engine = ReasoningEngine()
verdict = engine.solve_with_reflection("Design low-cost RAG for 10M compliance documents with zero cold-start penalty.")
print("=== FINAL ARCHITECTURAL VERDICT ===")
for k, v in verdict.items():
    print(f"• {k}: {v}")
`,
  },
];

export const PythonLabView: React.FC<PythonLabViewProps> = ({ onGainXp }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PythonTemplate>(PYTHON_TEMPLATES[0]);
  const [code, setCode] = useState<string>(PYTHON_TEMPLATES[0].code);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<{ stdout: string; stderr: string; executionTimeMs: number; success: boolean } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectTemplate = (template: PythonTemplate) => {
    setSelectedTemplate(template);
    setCode(template.code);
    setOutput(null);
  };

  const handleResetCode = () => {
    setCode(selectedTemplate.code);
    setOutput(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    try {
      const response = await fetch('/api/python/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setOutput(data);
      if (data.success) {
        onGainXp(35, `Ran Python Lab: ${selectedTemplate.title}`);
      }
    } catch (err: any) {
      setOutput({
        success: false,
        stdout: '',
        stderr: err.message || 'Failed to execute Python script',
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Terminal className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Interactive Python AI Lab & Sandbox
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Python 3.10 Runtime
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Execute real Python AI implementations directly in your browser. Practice RAG algorithms, Model Context Protocol tools, GPU VRAM sizing calculations, and reasoning loops.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-4 h-4 fill-white ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Executing Python...' : 'Run Python Code'}</span>
            </button>
          </div>
        </div>

        {/* Template Selectors */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-800/80">
          {PYTHON_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTemplate.id === tmpl.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{tmpl.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-medium">
                {tmpl.difficulty}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Output Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Python Code Editor */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-slate-400 font-mono ml-2 font-medium">
                {selectedTemplate.id}.py
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleResetCode}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset to template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[520px] bg-slate-950 text-slate-200 p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-indigo-600/40"
              spellCheck={false}
            />
          </div>

          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{selectedTemplate.category}</span>
            <span>Ctrl + Enter or click 'Run Python Code'</span>
          </div>
        </div>

        {/* Live Terminal Output */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Python Terminal Output</span>
            </div>

            {output && (
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-[11px] text-slate-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {output.executionTimeMs}ms
                </span>
                {output.success ? (
                  <span className="flex items-center text-emerald-400 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Passed
                  </span>
                ) : (
                  <span className="flex items-center text-rose-400 text-[11px] font-bold">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Error
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-4 flex-1 h-[520px] overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap">
            {isRunning ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p>Running code in Python 3.10 sandbox...</p>
              </div>
            ) : output ? (
              <>
                {output.stdout && (
                  <div className="text-emerald-300">{output.stdout}</div>
                )}
                {output.stderr && (
                  <div className="text-rose-400 mt-2 p-2 bg-rose-950/30 rounded border border-rose-900/50">
                    {output.stderr}
                  </div>
                )}
                {!output.stdout && !output.stderr && (
                  <div className="text-slate-500 italic">Code executed with no output.</div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 text-center p-6">
                <Cpu className="w-10 h-10 text-slate-600 mb-1" />
                <p className="font-semibold text-slate-400">Ready to execute</p>
                <p className="text-[11px] max-w-xs text-slate-500">
                  Click 'Run Python Code' to run this script through our native Python engine and inspect real results.
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Earn +35 XP per run</span>
            </span>
            <span className="text-slate-500">Fast execution</span>
          </div>
        </div>
      </div>
    </div>
  );
};
