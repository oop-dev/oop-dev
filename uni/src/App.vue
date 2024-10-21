<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style>
/* @import '~tailwindcss/base';
@import '~tailwindcss/components';
@import '~tailwindcss/utilities'; */
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
