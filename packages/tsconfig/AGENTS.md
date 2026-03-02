# @laughtrack/tsconfig

Shared TypeScript configurations for Laughtrack monorepo.

To use, add to devDependencies and extend in your `tsconfig.json`:
- `node` apps: `"extends": "@laughtrack/tsconfig/node.json"`
- `react` apps: `"extends": "@laughtrack/tsconfig/react.json"`
- `react-native` apps: `"extends": "@laughtrack/tsconfig/react-native.json"`
- `packages`: `"extends": "@laughtrack/tsconfig/base.json"`
