#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <project-dir> [--push]"
  exit 1
fi

PROJECT="$1"
PUSH=false
if [[ "${2:-}" == "--push" ]]; then PUSH=true; fi

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# add to .gitignore if not present
if ! grep -qxF "/$PROJECT/" .gitignore 2>/dev/null; then
  printf "\n# ignored by remove-project script\n/%s/\n" "$PROJECT" >> .gitignore
  git add .gitignore
fi

# untrack the directory (safe if not tracked)
git rm -r --cached --ignore-unmatch "$PROJECT"

# commit if there is anything to commit
if ! git diff --cached --quiet; then
  git commit -m "Remove project '$PROJECT' from repository (untracked and ignored)"
  if $PUSH; then git push; fi
  echo "Committed removal of '$PROJECT'."
else
  echo "No changes to commit (maybe nothing was tracked)."
fi

echo "Done. Local files still exist; delete manually if desired."
