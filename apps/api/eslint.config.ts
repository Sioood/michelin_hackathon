import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import eslint from '@michelin_hackaton/eslint'
import globals from 'globals'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default eslint(
  {
    oxlint: resolve(__dirname, '.oxlintrc.json'),
    tsconfigRootDir: __dirname,
    typescript: true,
    vue: false,
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
)
