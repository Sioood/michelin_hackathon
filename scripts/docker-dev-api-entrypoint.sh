#!/bin/sh
set -e

cd /app

# Materialize Linux native optional deps inside the container-mounted node_modules volume.
pnpm install --frozen-lockfile

exec "$@"
