const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Stub out Web-only modules that @rn-primitives pulls in via @radix-ui
// These are not needed on React Native and will cause Metro bundler errors
config.resolver.resolveRequest = (context, moduleName, options) => {
  if (
    moduleName.startsWith('@radix-ui') ||
    moduleName === 'react-dom' ||
    moduleName === 'react-dom/client'
  ) {
    return { type: 'empty', filePath: '' };
  }
  return context.resolveRequest(context, moduleName, options);
};

module.exports = config;
