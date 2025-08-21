module.exports = {
  root: true,
  extends: ['@dreamcrafter/eslint-config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./packages/*/tsconfig.json'],
  },
};