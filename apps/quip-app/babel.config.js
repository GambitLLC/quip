module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    //Warning: Reanimated plugin has to be listed last!!!
    plugins: ['react-native-reanimated/plugin']
  };
};
