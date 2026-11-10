#!/bin/bash

# Setup script to install git pre-commit hook
# Usage: bash scripts/setup-hooks.sh

HOOKS_DIR=".git/hooks"
SOURCE_HOOK="scripts/pre-commit"
TARGET_HOOK="$HOOKS_DIR/pre-commit"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "❌ Error: .git directory not found. Are you in a git repository?"
  exit 1
fi

if [ ! -f "$SOURCE_HOOK" ]; then
  echo "❌ Error: scripts/pre-commit not found."
  exit 1
fi

cp "$SOURCE_HOOK" "$TARGET_HOOK"
chmod +x "$TARGET_HOOK"

echo "✅ Pre-commit hook installed at $TARGET_HOOK"
echo "   It will run: pnpm check → pnpm lint → pnpm test before each commit"
