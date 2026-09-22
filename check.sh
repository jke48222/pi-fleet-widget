#!/usr/bin/env bash
# Diagnostics ("doctor") for this Übersicht widget. Read-only: it checks setup
# and prints pass/fail per item so you can see exactly why a widget is blank.
#
# Usage:  ./check.sh
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG="$HOME/.config/widgetsuite"
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
pass() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$*"; }
NAME="$(basename "$(/bin/ls -d "$DIR"/*.widget 2>/dev/null | head -1)")"
echo "Checking ${NAME:-widget}"
if [ -d "$WIDGETS" ]; then pass "Übersicht widgets folder found"; else fail "Übersicht widgets folder missing ($WIDGETS) — install Übersicht"; fi
if [ -n "${NAME:-}" ] && [ -d "$WIDGETS/$NAME" ]; then pass "$NAME is installed"; else warn "$NAME not copied into Übersicht yet — run ./install.sh"; fi
if pgrep -x "Übersicht" >/dev/null 2>&1; then pass "Übersicht is running"; else warn "Übersicht is not running"; fi
if command -v python3 >/dev/null 2>&1; then pass "python3 found"; else fail "python3 not found"; fi
if [ -f "$CFG/pi-fleet.json" ]; then pass "config found at $CFG/pi-fleet.json"; python3 - "$CFG/pi-fleet.json" <<'PY2'
import json, sys, subprocess
cfg = json.load(open(sys.argv[1]))
for h in cfg.get("hosts", []):
    r = subprocess.run(["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=4", "-o", "LogLevel=ERROR", "-p", str(h.get("port", 22)), f"{h.get('user','pi')}@{h['host']}", "true"], capture_output=True, text=True)
    print(("  \033[32m✓\033[0m " if r.returncode == 0 else "  \033[31m✗\033[0m ") + f"{h.get('name', h['host'])}: " + ("reachable" if r.returncode == 0 else (r.stderr.strip().split(chr(10)) or ["unreachable"])[-1][:70]))
PY2
else warn "no config — run ./install.sh or copy setup/pi-fleet.example.json to $CFG/pi-fleet.json (sample data will show)"; fi
