# eslint-plugin-svelte-reactive-vars

Automatically declares variables from reactive statements (`$:`) in Svelte if they haven't been explicitly declared.

## Installation

```bash
npm install --save-dev eslint-plugin-svelte-reactive-vars
```

## Usage

```js
// .eslintrc.cjs or .eslintrc.js
module.exports = {
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ['svelte-reactive-vars'],
    extends: ['plugin:svelte-reactive-vars/recommended'],
    overrides: [
        {
            files: ['*.svelte'],
            processor: 'svelte3/svelte3',
        },
    ],
};
```

## Example

```svelte
<script lang="ts">
$: foo = 'hello'; // Will automatically insert: let foo: string;
</script>
```
