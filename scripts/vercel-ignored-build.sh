#!/usr/bin/env bash

# In Vercel Ignored Build Step:
# - exit 1 => continue build/deploy
# - exit 0 => skip build/deploy
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ] || [ "$VERCEL_GIT_COMMIT_REF" = "develop" ]; then
  exit 1
else
  exit 0
fi
