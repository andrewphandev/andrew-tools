module.exports = {
  extends: ['airbnb-base', 'eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    semi: [1, 'always'],
    quotes: [2, 'single'],
    cSpell: 0,
    'import/prefer-default-export': 0,
    // 'linebreak-style': 0,
    'no-useless-escape': 0,
    'consistent-return': 0,
    'no-useless-catch': 0,
    'no-unused-vars': 1,
    'object-curly-newline': 1,
    'no-console': 0,
    'newline-per-chained-call': [
      'error',
      {
        ignoreChainWithDepth: 10,
      },
    ],
    'dot-notation': 0,
  },
  env: {
    es6: true,
    browser: true,
  },
};
