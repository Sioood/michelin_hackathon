#!/bin/sh
set -e

export CI=true
cd /app

# Skip lifecycle scripts during install — we run nuxt prepare explicitly below in layer order.
pnpm install --frozen-lockfile --ignore-scripts

pnpm --filter @michelin_hackaton/nuxt-essentials exec nuxt prepare
pnpm --filter @michelin_hackaton/ui exec nuxt prepare
pnpm --filter @michelin_hackaton/web exec nuxt prepare

exec "$@"
