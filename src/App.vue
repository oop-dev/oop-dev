<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
<template>
  <RouterView />
</template>
<style>
.el-pagination {
  position: fixed;
  bottom: 75px; /* Distance from the bottom of the viewport */
  left: 55%;
  transform: translateX(-50%);
  z-index: 100;
}
</style>
<style lang="postcss">
/* @import '~tailwindcss/base';
@import '~tailwindcss/components';
@import '~tailwindcss/utilities'; */
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
