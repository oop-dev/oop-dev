<script lang="ts" setup>
import {ref} from "vue";

let prop=defineProps({clazz: '',obj: {}})
let cols=JSON.parse(localStorage.getItem('classMap'))[prop.clazz]
let list=ref([prop.obj])
</script>
<template>
  <el-table :data="list" style="width: 100%">
    <el-table-column
        v-for="item in cols"
        :label="item.tag"
        :prop="item.col"
    >
      <template #default="scope">
        <el-input v-if="!scope.row['delete']" v-model="scope.row[item.col]" placeholder="请输入" />
      </template>
    </el-table-column>
  </el-table>
</template>
<style scoped>
/* 添加一些基本的样式 */
</style>
