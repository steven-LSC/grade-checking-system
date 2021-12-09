module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'max-len': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "no-underscore-dangle": 0,
    "import/no-dynamic-require": 0,
    "global-require": 0,
    "no-param-reassign": 0,
    "no-use-before-define": ["error", { "functions": false }]
  },
};
