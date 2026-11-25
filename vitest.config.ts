import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Fail fast with a clear message on the wrong Node. Older Node versions crash deep inside jsdom's
// dependencies (e.g. undici needs zlib zstd support) with an unhelpful "reading 'bind'" error.
const REQUIRED_NODE_MAJOR = 24
const nodeMajor = Number(process.versions.node.split('.')[0])
if (nodeMajor < REQUIRED_NODE_MAJOR) {
  throw new Error(
    `Firefly needs Node ${String(REQUIRED_NODE_MAJOR)} (see .nvmrc), but this is Node ${process.versions.node}. Run \`nvm use\` and try again.`,
  )
}

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov', 'json-summary'],
        include: ['src/**/*.{ts,tsx}'],
        // main.tsx only mounts <App /> into the DOM; the E2E tests cover it. Types are generated.
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/types/**'],
        // Every line, branch and function in src/ is covered by unit or component tests. New code
        // ships with its tests. See CLAUDE.md §6 for the rules on ignore hints.
        thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      },
    },
  }),
)
