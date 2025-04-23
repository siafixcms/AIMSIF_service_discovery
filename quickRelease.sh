#!/usr/bin/env bash
#
# Release helper ─ bumps version, commits, tags, pushes
# Usage: ./release.sh [patch | minor | major]        # default = patch

set -euo pipefail

# 1 ▪ choose bump type (default ⇒ patch)
bumpType=${1:-patch}

# 2 ▪ run the full test suite first — abort on any failure
npm test

# 3 ▪ update package.json / package‑lock.json  (no auto‑commit / tag)
newVersion=$(npm version "$bumpType" --no-git-tag-version)

# 4 ▪ stage every change — code + package files — then commit once
git add .
git commit -m "$newVersion"

# 5 ▪ create the matching Git tag manually
git tag "$newVersion"

# 6 ▪ push commit and tag
git push origin master --tags
