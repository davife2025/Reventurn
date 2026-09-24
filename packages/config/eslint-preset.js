/** Shared ESLint preset — extended by each app's own .eslintrc. */
module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  env: {
    es2022: true,
    node: true
  },
  ignorePatterns: ["dist", ".next", "node_modules"]
};
