#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend"
DIST_DIR="$SCRIPT_DIR/dist"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
fail() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# Add Deno to PATH if installed in default location
if [ -d "$HOME/.deno/bin" ]; then
  export PATH="$HOME/.deno/bin:$PATH"
fi

echo "========================================"
echo "  Claude Code Web UI — Build Script"
echo "========================================"
echo ""

# --- Check prerequisites ---
echo "--- Checking prerequisites ---"

command -v npm      >/dev/null 2>&1 || fail "npm is not installed"

if ! command -v deno >/dev/null 2>&1; then
  warn "Deno not found. Installing Deno..."
  curl -fsSL https://deno.land/install.sh | sh
  export PATH="$HOME/.deno/bin:$PATH"
  log "Deno installed"
fi
log "npm  $(npm --version)"
log "deno $(deno --version | head -1)"
echo ""

# --- Install & build frontend ---
echo "--- Frontend ---"

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  warn "Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install) || fail "Frontend npm install failed"
fi

(cd "$FRONTEND_DIR" && npm run build) || fail "Frontend build failed"
log "Frontend built in $FRONTEND_DIR/dist"
echo ""

# --- Clean & copy frontend to backend ---
echo "--- Copy frontend assets ---"
rm -rf "$BACKEND_DIR/dist"
cp -r "$FRONTEND_DIR/dist" "$BACKEND_DIR/dist"
log "Frontend assets copied to $BACKEND_DIR/dist"
echo ""

# --- Generate version file ---
echo "--- Backend ---"

(cd "$BACKEND_DIR" && deno task generate-version) || fail "Version generation failed"
log "Version file generated"
echo ""

# --- Install backend deps & compile ---
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  warn "Installing backend dependencies..."
  (cd "$BACKEND_DIR" && npm install) || fail "Backend npm install failed"
fi

(cd "$BACKEND_DIR" && deno task copy-frontend) || fail "Copy frontend failed"

echo "Compiling binary (this may take a minute)..."
(cd "$BACKEND_DIR" && deno task build) || fail "Backend compile failed"

BINARY="$DIST_DIR/claude-code-webui"
if [ ! -f "$BINARY" ]; then
  fail "Binary not found at $BINARY"
fi

echo ""
echo "========================================"
log "Build complete!"
echo "========================================"
ls -lh "$BINARY" | awk '{print "  Size: " $5}'
echo "  Path: $BINARY"
echo ""
echo "Run it with:"
echo "  $BINARY"
echo "  $BINARY --port 9000 --host 0.0.0.0"
