#!/usr/bin/env python3
"""Check a saved Vercel web_fetch_vercel_url result (the JSON file the harness writes when a result is too big).
Usage: check-fetch.py <saved-result-file> [expected text ...]
Prints status, content-type, matched route, <title>, PNG size when the body is an image, and whether each expected
text is present. Exit 1 if the status is not 2xx or an expected text is missing. Binary bodies arrive lossy (UTF-8
replacement chars), so for images trust status + content-type + PNG header size, not pixels."""
import json, re, struct, sys
if len(sys.argv) < 2: sys.exit(__doc__)
d = json.load(open(sys.argv[1])); t = d.get("text", ""); h = {k.lower(): v for k, v in d.get("headers", {}).items()}
out = {"status": d.get("status"), "content_type": h.get("content-type"), "matched_path": h.get("x-matched-path")}
m = re.search(r"<title>(.*?)</title>", t); out["title"] = m.group(1) if m else None
if t.startswith("�PNG") or t[1:4] == "PNG":
    i = t.find("IHDR")
    if i > 0:
        b = t[i + 4:i + 12].encode("latin-1", "replace")
        out["png_size"] = list(struct.unpack(">II", b))
ok = isinstance(out["status"], int) and 200 <= out["status"] < 300
out["expected"] = {e: (e in t) for e in sys.argv[2:]}
ok = ok and all(out["expected"].values())
out["ok"] = ok
print(json.dumps(out, ensure_ascii=False)); sys.exit(0 if ok else 1)
