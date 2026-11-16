#!/usr/bin/env python3
"""Stand-in for samwise.life in the Mac app's end-to-end check.

Usage: mock_server.py <port> <dir>
Serves <dir>/config.json as GET /api/mac/config (one line per request in <dir>/gets.log) and writes
every POST to <dir>/requests.jsonl.
All data in it is made up; no real account is involved.
"""
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = int(sys.argv[1])
DIR = sys.argv[2]
TOKEN = "test-token"


class Handler(BaseHTTPRequestHandler):
    def reply(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def authed(self):
        return self.headers.get("Authorization", "") == "Bearer " + TOKEN

    def config(self):
        with open(os.path.join(DIR, "config.json")) as f:
            return json.load(f)

    def do_GET(self):
        if self.path.startswith("/api/mac/config"):
            if not self.authed():
                return self.reply(401, {"error": "This Mac is not connected."})
            # One line per answered schedule request, so the check can count how often the app asks.
            with open(os.path.join(DIR, "gets.log"), "a") as f:
                f.write(self.path + "\n")
            return self.reply(200, self.config())
        self.reply(404, {"error": "Not found."})

    def do_POST(self):
        n = int(self.headers.get("Content-Length", "0") or 0)
        raw = self.rfile.read(n) if n else b"{}"
        try:
            body = json.loads(raw or b"{}")
        except Exception:
            body = {}
        with open(os.path.join(DIR, "requests.jsonl"), "a") as f:
            f.write(json.dumps({"path": self.path, "auth": self.authed(), "body": body}) + "\n")
        if self.path == "/api/mac/pair/start":
            return self.reply(200, {"ok": True})
        if self.path in ("/api/mac/pair/verify", "/api/mac/pair/code"):
            if body.get("code") in ("123456", "TESTCODE"):
                return self.reply(200, {"token": TOKEN, "config": self.config()})
            return self.reply(400, {"error": "That code did not work."})
        if not self.authed():
            return self.reply(401, {"error": "This Mac is not connected."})
        self.reply(200, {"ok": True})

    def log_message(self, *args):
        pass


HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
