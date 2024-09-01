<template>
  <el-container style="height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #f5f7fa;">
    <el-card class="login-card" shadow="never">
      <h2 class="login-title">Oadmin</h2>
      <el-form class="login-form" label-width="100px" @submit.native.prevent="login">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="o.name" placeholder="请输入用户名" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="o.pwd" placeholder="请输入密码" prefix-icon="el-icon-lock" />
        </el-form-item>
        <el-form-item label="验证码" prop="captcha">
          <el-input v-model="o.code" placeholder="请输入验证码" />
          <Captcha :o="o"></Captcha>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" native-type="submit" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-container>
</template>

<script setup>
import {inject, onMounted, reactive, ref} from 'vue';
import Captcha from "@/components/Captcha.vue";
import {New} from "../../VueProxy";
import {User} from "../../api/User";
import {to} from "@/router/index";
let o=New(User)

const form = reactive({
  name: '',
  pwd: '',
  captcha: '',
});
async function login() {
  o.token=localStorage.getItem('captcha_token')
  let rsp=await o.login()
  localStorage.setItem('user',JSON.stringify(rsp.user))
  localStorage.setItem('token',rsp.token)

  to('dash')
}
</script>

<style scoped>
.login-card {
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.login-title {
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
  color: #333;
}

.login-form {
  max-width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  border-radius: 4px;
}

.el-button {
  width: 100%;
  border-radius: 4px;
}

.login-button {
  font-size: 16px;
}

.captcha-image {
  margin-top: 10px;
  cursor: pointer;
  width: 100%;
  height: 50px;
  object-fit: cover;
}
</style>
