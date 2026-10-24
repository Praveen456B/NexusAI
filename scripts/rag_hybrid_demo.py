#!/usr/bin/env python3
"""
Production Hybrid RAG & Reciprocal Rank Fusion (RRF) in Pure Python
Demonstrates BM25 + Vector Cosine Retrieval + Cross Rank Fusion
"""

import math
from collections import Counter
import json

class SimpleHybridRAG:
    def __init__(self, documents):
        self.documents = documents
        self.doc_tokens = [self.tokenize(d["text"]) for d in documents]
        self.doc_count = len(documents)
        self.avg_doc_len = sum(len(dt) for dt in self.doc_tokens) / max(1, self.doc_count)
        self.df = Counter()
        for dt in self.doc_tokens:
            for term in set(dt):
                self.df[term] += 1

    def tokenize(self, text):
        return [w.strip(".,!?:;\"'()[]{}").lower() for w in text.split() if w]

    def bm25_score(self, query: str, k1=1.5, b=0.75):
        q_tokens = self.tokenize(query)
        scores = []
        for i, dt in enumerate(self.doc_tokens):
            score = 0.0
            doc_len = len(dt)
            tf = Counter(dt)
            for term in q_tokens:
                if term in tf:
                    doc_freq = self.df.get(term, 0)
                    idf = math.log((self.doc_count - doc_freq + 0.5) / (doc_freq + 0.5) + 1.0)
                    term_freq = tf[term]
                    numerator = term_freq * (k1 + 1)
                    denominator = term_freq + k1 * (1 - b + b * (doc_len / self.avg_doc_len))
                    score += idf * (numerator / denominator)
            scores.append((self.documents[i]["id"], score))
        return sorted(scores, key=lambda x: x[1], reverse=True)

    def mock_dense_vector_search(self, query: str):
        # Simulated semantic vector search with contextual relevance
        keywords_semantic = {
            "mcp": ["tool-protocol", "anthropic-mcp"],
            "vllm": ["serving-engine", "gpu-kvcache"],
            "rag": ["contextual-chunks", "vector-db"],
            "hallucination": ["ragas-eval", "contextual-chunks"]
        }
        q_lower = query.lower()
        scores = []
        for doc in self.documents:
            score = 0.1
            for k, match_ids in keywords_semantic.items():
                if k in q_lower and doc["id"] in match_ids:
                    score += 0.85
            scores.append((doc["id"], score))
        return sorted(scores, key=lambda x: x[1], reverse=True)

    def reciprocal_rank_fusion(self, query: str, k=60):
        bm25_ranks = self.bm25_score(query)
        vector_ranks = self.mock_dense_vector_search(query)
        
        fused = {}
        # Apply RRF
        for rank, (doc_id, _) in enumerate(bm25_ranks):
            fused[doc_id] = fused.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
            
        for rank, (doc_id, _) in enumerate(vector_ranks):
            fused[doc_id] = fused.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
            
        ranked = sorted(fused.items(), key=lambda x: x[1], reverse=True)
        return ranked

if __name__ == "__main__":
    docs = [
        {"id": "tool-protocol", "text": "Anthropic Model Context Protocol (MCP) standardizes LLM access to external databases and dev tools over stdio and SSE."},
        {"id": "serving-engine", "text": "vLLM introduces PagedAttention and continuous batching to maximize GPU memory throughput for Qwen and DeepSeek models."},
        {"id": "contextual-chunks", "text": "Contextual Retrieval prepends document summaries to chunks, dropping RAG hallucinations by 65% in production."},
        {"id": "ragas-eval", "text": "Ragas automates evaluation of faithfulness, answer relevancy, and context recall in continuous integration."},
    ]
    
    rag = SimpleHybridRAG(docs)
    test_query = "How do we reduce hallucinations in production RAG systems?"
    print(f"=== Running Python Hybrid RAG Search ===")
    print(f"Query: '{test_query}'\n")
    
    results = rag.reciprocal_rank_fusion(test_query)
    for rank, (doc_id, score) in enumerate(results, 1):
        doc = next(d for d in docs if d["id"] == doc_id)
        print(f"[{rank}] Score: {score:.5f} | ID: {doc_id}")
        print(f"    Excerpt: {doc['text']}\n")
