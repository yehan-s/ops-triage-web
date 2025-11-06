#!/usr/bin/env bash
set -euo pipefail

HOOK=pre-commit
SRC="$(cd "$(dirname "$0")" && pwd)/hooks/$HOOK"
DEST="$(git rev-parse --git-dir)/hooks/$HOOK"

mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
chmod +x "$DEST"
echo "Installed git hook: $DEST"

