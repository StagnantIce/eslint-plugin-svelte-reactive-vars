# eslint-plugin-svelte-reactive-vars

Автоматически объявляет переменные из реактивных выражений (`$:`) в Svelte, если они не были явно объявлены.

## Установка

```bash
npm install --save-dev eslint-plugin-svelte-reactive-vars
```

## Использование

```js
// .eslintrc.cjs
module.exports = {
  plugins: ['svelte-reactive-vars'],
  extends: ['plugin:svelte-reactive-vars/recommended'],
};
```

## Пример

```svelte
<script lang="ts">
$: foo = 'hello'; // Автоматически будет вставлено: let foo: string;
</script>
```