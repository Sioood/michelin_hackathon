# @michelin_hackaton/config

Shared tooling configurations for the monorepo: TypeScript, ESLint, and Oxlint.

## Packages

### `@michelin_hackaton/typescript`

Base TypeScript configuration preset.

```jsonc
// tsconfig.json
{ "extends": ["@michelin_hackaton/typescript/base.json"] }
```

Key settings: strict mode, ESNext target, DOM lib, JSON modules, skip lib check.

### `@michelin_hackaton/eslint`

Composable ESLint flat config factory.

```ts
// eslint.config.ts
import eslint from '@michelin_hackaton/eslint'

export default eslint({
  typescript: true,
  vue: true,
  oxlint: resolve(__dirname, '.oxlintrc.json'),
  tsconfigRootDir: __dirname,
})
```

Includes: TypeScript rules, import-x, JSONC, Markdown, YAML, Vue, oxlint bridge.

### `@michelin_hackaton/oxlint`

Shared Oxlint configuration.

```jsonc
// .oxlintrc.json
{ "extends": ["../../packages/config/oxlint/.oxlintrc.json"] }
```

Plugins: typescript, unicorn, oxc.
Key rules: `no-unused-vars` (with `_` ignore), `eqeqeq`, `no-explicit-any`, `no-array-for-each`.

## Adding Rules

1. Check if oxlint supports it (faster, native) → add to `@michelin_hackaton/oxlint/.oxlintrc.json`
2. If ESLint-only, add to `@michelin_hackaton/eslint/src/configs/<category>.ts`
3. Always ensure `eslint-plugin-oxlint` bridge prevents duplicate reports
