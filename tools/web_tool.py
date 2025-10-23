# tools/web_tool.py
import argparse, json, sys, requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from readability import Document

UA = {"User-Agent": "Mozilla/5.0"}
# Segurança opcional: restrinja domínios confiáveis. Ex.: ["gov.br", "saude.gov.br", "datasus.gov.br"]
ALLOW = []  # deixe [] para permitir qualquer site

def _allowed(url: str) -> bool:
    if not ALLOW:
        return True
    from urllib.parse import urlparse
    host = (urlparse(url).hostname or "").lower()
    return any(host.endswith(dom.lower()) for dom in ALLOW)

def search(query: str, max_results: int = 5):
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=max_results):
            results.append({
                "title": r.get("title"),
                "href": r.get("href"),
                "snippet": r.get("body"),
            })
    print(json.dumps(results, ensure_ascii=False, indent=2))

def _extract_main_text(html: str) -> str:
    doc = Document(html)
    summary_html = doc.summary()
    soup = BeautifulSoup(summary_html, "html.parser")
    text = soup.get_text(separator="\n")
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return "\n".join(lines)[:20000]

def get(url: str):
    if not _allowed(url):
        raise SystemExit(json.dumps({"error": "URL não permitida pela ALLOW list", "url": url}))
    resp = requests.get(url, headers=UA, timeout=25)
    resp.raise_for_status()
    text = _extract_main_text(resp.text)
    print(json.dumps({"url": url, "chars": len(text), "text": text}, ensure_ascii=False))

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    s1 = sub.add_parser("search"); s1.add_argument("query")
    s2 = sub.add_parser("get");    s2.add_argument("url")
    a = ap.parse_args()
    try:
        if a.cmd == "search":
            search(a.query)
        elif a.cmd == "get":
            get(a.url)
    except Exception as e:
        print(json.dumps({"error": str(e)})); sys.exit(1)

