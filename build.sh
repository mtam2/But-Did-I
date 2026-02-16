#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$SCRIPT_DIR/dist"
OUT_FILE="$OUT_DIR/but-did-i.html"

mkdir -p "$OUT_DIR"

awk -v dir="$SCRIPT_DIR" '
  /href="style.css"/ {
    print "    <style>"
    while ((getline line < (dir "/style.css")) > 0) print line
    print "    </style>"
    next
  }
  /src="app.js"/ {
    print "    <script>"
    while ((getline line < (dir "/app.js")) > 0) print line
    print "    </script>"
    next
  }
  { print }
' "$SCRIPT_DIR/index.html" > "$OUT_FILE"

echo "Built $OUT_FILE"
