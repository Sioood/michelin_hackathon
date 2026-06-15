# @michelin_hackaton/typescript

Shared TypeScript config presets for the monorepo.

## Available presets

- `base.json`: strict defaults for Node + browser-aware projects.

## Usage

`tsconfig.json`:

```json
{
  "extends": ["@michelin_hackaton/typescript/base.json"]
}
```

## Scripts

- `pnpm format`: formats JSON config files with `oxfmt`.
- `pnpm format:check`: validates formatting with `oxfmt`.
