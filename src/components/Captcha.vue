<template>
  <div>
    <img @click="generateCaptcha" :src="captchaDataUrl" alt="验证码" />
  </div>
</template>

<script setup>
let prop=defineProps({o: {}})
import { ref, onMounted } from 'vue';

// 定义一个响应式变量来保存验证码文本和Base64图片数据
const captchaText = ref(''); // 保存验证码文本
const captchaDataUrl = ref(''); // 保存验证码Base64图片数据

// 生成随机文本的函数
function generateRandomText(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    text += charset[randomIndex];
  }
  return text;
}

// 生成验证码的函数
async function generateCaptcha() {
  let {code,token} =await prop.o.captcha()//云函数，云对象，禁止返回code，data，msg
  localStorage.setItem('captcha_token',token)
  const canvas = document.createElement('canvas'); // 创建一个隐藏的Canvas
  const ctx = canvas.getContext('2d');
  const width = 257; // 图像宽度
  const height = 70; // 图像高度
  canvas.width = width;
  canvas.height = height;

  // 生成随机的验证码文本
  captchaText.value = code

  // 绘制背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 绘制验证码文本
  ctx.font = '60px Arial';
  ctx.fillStyle = '#1D111F';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(captchaText.value, width / 2, height / 2);

  // 添加干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = '#1E90FF';
    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.bezierCurveTo(Math.random() * width, Math.random() * height,Math.random() * width, Math.random() * height,Math.random() * width, Math.random() * height); // 使用贝塞尔曲线绘制路径
    ctx.stroke();
  }

  // 将Canvas转换为Base64图片数据
  captchaDataUrl.value = canvas.toDataURL('image/png');
}

// 在组件挂载时生成初始验证码
onMounted(() => {
  generateCaptcha();
});
</script>

<style scoped>
img {
  border: 1px solid #ddd;
  margin-bottom: 10px;
}
button {
  display: block;
  margin-bottom: 10px;
}
</style>
