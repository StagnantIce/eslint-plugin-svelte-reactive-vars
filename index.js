module.exports = {
  rules: {
    'require-declare-reactive': require('./lib/rules/require-declare-reactive'),
  },
  configs: {
    recommended: {
      plugins: ['svelte-reactive-vars'],
      rules: {
        'svelte-reactive-vars/require-declare-reactive': 'warn',
      },
    },
  },
};