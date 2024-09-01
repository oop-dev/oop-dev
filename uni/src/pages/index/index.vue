<template>
  <up-swiper
      :list="list1"
      @change="change"
      @click="click"
  ></up-swiper>
</template>
<script setup>
import { reactive } from 'vue';

// 使用 reactive 创建响应式数组
const list1 = reactive([
  'https://cdn.uviewui.com/uview/swiper/swiper1.png',
  'https://cdn.uviewui.com/uview/swiper/swiper2.png',
  'https://cdn.uviewui.com/uview/swiper/swiper3.png',
]);
</script>
