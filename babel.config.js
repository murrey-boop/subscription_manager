module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "^@/(.+)": "./\\1",
          },
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
