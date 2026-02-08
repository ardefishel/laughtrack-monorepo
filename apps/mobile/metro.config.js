const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Minimal monorepo support - watch workspace for changes
config.watchFolders = [workspaceRoot];

// Allow resolving packages from both project and workspace node_modules
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules')
];

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css'
});
