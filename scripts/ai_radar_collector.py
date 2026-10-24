#!/usr/bin/env python3
"""
NexusAI - Python AI Radar & Live Blog Aggregator
Fetches, cleans, and categorizes live RSS/Atom feeds from top AI labs and research journals.
"""

import sys
import json
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
import re
import html

FEED_SOURCES = [
    {
        "id": "openai",
        "name": "OpenAI News & Research",
        "category": "Labs",
        "feed_url": "https://openai.com/news/rss.xml",
        "site_url": "https://openai.com/news",
    },
    {
        "id": "google-deepmind",
        "name": "Google DeepMind",
        "category": "Labs",
        "feed_url": "https://deepmind.google/blog/rss.xml",
        "site_url": "https://deepmind.google/discover/blog",
    },
    {
        "id": "huggingface",
        "name": "Hugging Face Blog",
        "category": "Engineering",
        "feed_url": "https://huggingface.co/blog/feed.xml",
        "site_url": "https://huggingface.co/blog",
    },
    {
        "id": "simon-willison",
        "name": "Simon Willison AI Notes",
        "category": "Engineering",
        "feed_url": "https://simonwillison.net/atom/everything/",
        "site_url": "https://simonwillison.net",
    },
    {
        "id": "mit-tech-review",
        "name": "MIT Technology Review AI",
        "category": "News",
        "feed_url": "https://www.technologyreview.com/topic/artificial-intelligence/feed",
        "site_url": "https://www.technologyreview.com/topic/artificial-intelligence",
    },
    {
        "id": "venturebeat-ai",
        "name": "VentureBeat AI",
        "category": "News",
        "feed_url": "https://venturebeat.com/category/ai/feed",
        "site_url": "https://venturebeat.com/category/ai",
    },
    {
        "id": "arxiv-ai",
        "name": "arXiv cs.AI (Artificial Intelligence)",
        "category": "Research",
        "feed_url": "https://rss.arxiv.org/rss/cs.AI",
        "site_url": "https://arxiv.org/list/cs.AI/recent",
    },
]

def clean_html(raw_html: str) -> str:
    """Strip HTML tags and unescape HTML entities."""
    if not raw_html:
        return ""
    clean = re.sub(r"<[^>]+>", "", raw_html)
    clean = html.unescape(clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean

def classify_roles_and_impact(title: str, summary: str):
    """Categorize target engineering roles and technical impact based on content."""
    text = (title + " " + summary).lower()
    
    roles = []
    if any(k in text for k in ["api", "protocol", "mcp", "sdk", "python", "backend", "deploy", "server", "docker", "code", "database"]):
        roles.append("SWE")
    if any(k in text for k in ["train", "finetune", "weights", "benchmark", "dataset", "diffusion", "reasoning", "quantization", "vllm", "lora"]):
        roles.append("ML Engineer")
    if any(k in text for k in ["architecture", "scale", "infrastructure", "enterprise", "system", "cluster", "gpu", "cost", "latency"]):
        roles.append("Tech Lead")
    if any(k in text for k in ["product", "user", "roi", "governance", "safety", "adoption", "business", "workflow"]):
        roles.append("Product Manager")
        
    if not roles:
        roles = ["SWE", "Tech Lead"]

    # Impact assessment
    if any(k in text for k in ["breakthrough", "standard", "mcp", "deepseek-r1", "critical", "vulnerability", "frontier", "revolution"]):
        impact = "Critical"
    elif any(k in text for k in ["release", "vllm", "performance", "speedup", "quantization", "sota", "benchmark", "gemini"]):
        impact = "High"
    else:
        impact = "Medium"

    # Extract tags
    tags = []
    keywords = ["MCP", "DeepSeek", "Gemini", "RAG", "vLLM", "Agents", "LangGraph", "PyTorch", "Quantization", "Fine-Tuning", "Ethics", "Reasoning"]
    for kw in keywords:
        if kw.lower() in text:
            tags.append(kw)
    if not tags:
        tags = ["AI", "Innovation"]

    return roles, impact, tags[:4]

def fetch_feed_items(source: dict):
    """Fetch and parse single RSS or Atom feed."""
    items = []
    try:
        req = urllib.request.Request(
            source["feed_url"],
            headers={
                "User-Agent": "NexusAI-Python-Collector/2.0 (Compatible; TechRadar/Linux)",
                "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml",
            },
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            xml_data = response.read()

        root = ET.fromstring(xml_data)

        # Handle RSS 2.0
        channel = root.find("channel")
        if channel is not None:
            for item in channel.findall("item")[:6]:
                title_elem = item.find("title")
                desc_elem = item.find("description")
                link_elem = item.find("link")
                pub_elem = item.find("pubDate")

                title = clean_html(title_elem.text if title_elem is not None else "Untitled Update")
                desc = clean_html(desc_elem.text if desc_elem is not None else "")
                link = link_elem.text.strip() if link_elem is not None and link_elem.text else source["site_url"]
                pub_date = pub_elem.text.strip() if pub_elem is not None and pub_elem.text else datetime.now(timezone.utc).isoformat()

                roles, impact, tags = classify_roles_and_impact(title, desc)

                items.append({
                    "id": f"{source['id']}-{hash(title) % 10000000}",
                    "title": title,
                    "source": source["name"],
                    "sourceId": source["id"],
                    "category": source["category"],
                    "pubDate": pub_date,
                    "link": link,
                    "summary": desc[:320] + ("..." if len(desc) > 320 else ""),
                    "readTime": f"{max(3, min(12, len(desc) // 180))} min read",
                    "tags": tags,
                    "impactLevel": impact,
                    "targetRoles": roles,
                })

        # Handle Atom feed
        else:
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            for entry in root.findall("atom:entry", ns)[:6]:
                title_elem = entry.find("atom:title", ns)
                summary_elem = entry.find("atom:summary", ns) or entry.find("atom:content", ns)
                link_elem = entry.find("atom:link", ns)
                updated_elem = entry.find("atom:published", ns) or entry.find("atom:updated", ns)

                title = clean_html(title_elem.text if title_elem is not None else "Untitled")
                desc = clean_html(summary_elem.text if summary_elem is not None else "")
                link = link_elem.attrib.get("href", source["site_url"]) if link_elem is not None else source["site_url"]
                pub_date = updated_elem.text.strip() if updated_elem is not None and updated_elem.text else datetime.now(timezone.utc).isoformat()

                roles, impact, tags = classify_roles_and_impact(title, desc)

                items.append({
                    "id": f"{source['id']}-{hash(title) % 10000000}",
                    "title": title,
                    "source": source["name"],
                    "sourceId": source["id"],
                    "category": source["category"],
                    "pubDate": pub_date,
                    "link": link,
                    "summary": desc[:320] + ("..." if len(desc) > 320 else ""),
                    "readTime": f"{max(3, min(12, len(desc) // 180))} min read",
                    "tags": tags,
                    "impactLevel": impact,
                    "targetRoles": roles,
                })

    except Exception as e:
        # Silently fail for unreachable feeds
        pass

    return items

def main():
    all_items = []
    for source in FEED_SOURCES:
        items = fetch_feed_items(source)
        all_items.extend(items)

    result = {
        "status": "success",
        "count": len(all_items),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "items": all_items,
    }
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
