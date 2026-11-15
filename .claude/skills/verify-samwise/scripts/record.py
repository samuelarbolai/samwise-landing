#!/usr/bin/env python3
"""Append one proof step to <evidence-dir>/steps.jsonl (MCP-driven checks have no screenshot, so this is the record).
Usage: record.py <evidence-dir> <step-name> key=value [key=value ...]
  e.g. record.py "$E" open-report tool=vercel.web_fetch_vercel_url url=/report/<redacted> status=200 expect='alt="Your week of check-ins"' found=yes
Long hex tokens (24+ chars) and phone numbers are redacted before writing; evidence lives in a shared folder."""
import json, re, sys, datetime, pathlib
if len(sys.argv) < 3: sys.exit(__doc__)
d = pathlib.Path(sys.argv[1]); d.mkdir(parents=True, exist_ok=True)
def red(v): v = re.sub(r"\b([0-9a-f]{6})[0-9a-f]{18,}\b", r"\1…", v); return re.sub(r"\+?\d[\d ]{9,}\d", "<phone>", v)
row = {"at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "step": sys.argv[2]}
for kv in sys.argv[3:]:
    k, _, v = kv.partition("="); row[k] = red(v)
with open(d / "steps.jsonl", "a") as f: f.write(json.dumps(row, ensure_ascii=False) + "\n")
print(json.dumps(row, ensure_ascii=False))
