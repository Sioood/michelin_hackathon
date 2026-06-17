#!/bin/sh
set -e

cd /app

# Materialize Linux native optional deps inside the container-mounted node_modules volume.
CI=true pnpm install --frozen-lockfile

exec "$@"
