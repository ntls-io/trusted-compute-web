// node_modules paths that should be treated as ES modules.
const esm = ["@websanova/vue-upload"];

module.exports = {
  preset: "@vue/cli-plugin-components-jest/presets/typescript-and-babel",
  setupFilesAfterEnv: ["./tests/components/setup-vue.ts"],
  transform: {
    "^.+\\.vue$": "vue-jest"
  },
  // Make Jest work with ES modules.
  // See:
  // https://jestjs.io/docs/configuration#transformignorepatterns-arraystring
  // https://jestjs.io/docs/tutorial-react-native#transformignorepatterns-customization
  transformIgnorePatterns: [
    `/node_modules/(?!(${esm.join("|")})/)`,
    "\\.pnp\\.[^\\/]+$"
  ]
};
