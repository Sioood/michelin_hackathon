#!/bin/sh
set -e

export CI=true
cd /app

pnpm install --frozen-lockfile --ignore-scripts

exec "$@"
