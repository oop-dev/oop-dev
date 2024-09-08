<template>
  <el-row class="tac">
    <el-col :span="3">
      <el-menu style="height: 140vh"
               active-text-color="#ffd04b"
               background-color="rgb(0,22,41)"
               class="el-menu-vertical-demo"
               default-active="2"
               text-color="#fff"
               @open="handleOpen"
               @close="handleClose"
               @select="handleSelect"
      >
        <el-menu-item index="0">
          <span style="font-size: 24px">&nbsp;&nbsp;oAdmin</span>
        </el-menu-item>
        <el-menu-item index="dash">
          <el-icon>
            <setting/>
          </el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <div v-for="menu in subMenus">
          <el-menu-item v-if="has(menu.index)&&!menu.children" :key="menu.index"
                        :index="menu.index">
            <el-icon>
              <setting/>
            </el-icon>
            <span>{{ menu.label }}</span>
          </el-menu-item>

          <el-sub-menu v-else-if="has(menu.index)&&menu.children"  :key="menu.index"
                       :index="menu.index">
            <template #title>
              <el-icon>
                <setting/>
              </el-icon>
              <span>{{ menu.label }}</span>
            </template>
            <div v-for="subItem in menu.children">
              <el-menu-item :key="subItem.index" :index="subItem.index">
                <pre>  </pre>
                {{ subItem.label }}
              </el-menu-item>
            </div>
          </el-sub-menu>
        </div>
        <el-menu-item index="login">
          <el-icon>
            <setting/>
          </el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-col>
    <el-col :span="21">
      <router-view></router-view>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>

import {useRouter} from "vue-router";
import {inject, onMounted, ref} from "vue";
import {to} from "@/router";

const router = useRouter();


let get = inject('get')
let subMenus = ref([])
let permission = ref([])
onMounted(async () => {
  let classMap=JSON.parse(localStorage.getItem('classMap'))
  let menu=JSON.parse(localStorage.getItem('menu'))
  console.log('menu',menu)
  Object.keys(classMap).filter(x => x !== 'system').forEach((x, index) => {
    if (menu[x]){
      subMenus.value.push({
        id: index, // 使用索引作为 id
        label: `${menu[x]}`, // 可以使用索引来生成唯一的 label 或其他内容
        index: `${x}/gets`, // 假设 `x` 是你需要的部分
      });
    }
  });
  //subMenus.value=await get('menu')
  subMenus.value.push(...[
    {
      "id": 3,
      "label": "管理",
      "index": "manager",
      "children": [{"index": "user/gets", "label": "用户"}, {"index": "role/gets", "label": "角色"}, {
        "index": "permission/gets",
        "label": "权限"
      }]
    }
  ])
  console.log('mmm', subMenus)
/*  if (localStorage.getItem("uid")) {
    router.push({name: 'dash'})
  } else {
    router.push({name: 'login'})
  }*/

  // 执行其他初始化操作
/*  console.log('permission', localStorage.getItem('permission'))
  //嵌套数组转成权限列表
  permission.value = localStorage.getItem('permission').split(',')
  console.log('permission list', permission)
  console.log('permission list', permission)*/
});

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  if (key == 'md') {
    location.href = 'http://everpay.cc:8080/README.html'
  }
  if (key == 'login') {
    localStorage.removeItem('uid')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  router.push({name: key})
  //to(key)
}

/*const permission=[
    'dash',
    '/user',
    '/manager',
  '/role',
  '/user/add',
  '/permission',
  '/menu',
]*/
function hasIntersection(array1, array2) {

  const set1 = new Set(array1.map(item => item['index']))
  return array2.some(item => set1.has(item));
}



</script>
