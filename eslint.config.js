import configs from '@roshan-labs/eslint-config'

export default [
  ...configs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
