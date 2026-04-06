const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
 
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Strip deprecated watcher option to avoid EAS/RN config validation warnings.
if (config.watcher && "unstable_workerThreads" in config.watcher) {
	delete config.watcher.unstable_workerThreads;
}
 
module.exports = withNativewind(config);