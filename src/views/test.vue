<script setup lang="ts">
import {Student} from "../../api/Student";
import {onMounted, ref} from "vue";
let s=new Student()
let msg=ref('')
onMounted(async ()=>{
  let rsp=await s.hello()
  alert(rsp)
  msg.value=rsp
})
</script>
<template>
<view>云对象测试页面</view> <br>
<br>
<view>云方法hello响应结果:{{msg}}</view>
</template>
<style scoped>
</style>
