<script setup lang="ts">
import {onMounted, ref} from "vue";
import {App} from "../../../api/App";
import {New} from "../../../VueProxy";
//后续会自动根据o对象生成
let o=New(App)//New(Orders,1) 两种方式，默认获取空对象，传id获取该id的对象，列表是渲染o.list时获取
//let name=Orders.name.toLowerCase()
let name='app'
</script>
<template>
  <view v-for="{col,tag,filter} in o.cols()">
    <el-input v-if="filter" v-model="o[col]" style="width: 220px" :placeholder="tag" />
  </view>
  <el-button @click="o.gets()" type="primary" plain style="margin-left: 10px ">查询</el-button>
  <el-button @click="exp" type="primary" plain >导出</el-button>
  <el-table  :data="o.list" style="width: 100%">
    <el-table-column fiexd
                     v-for="column in o.cols()"
                     :label="column.tag"
                     :prop="column.col"
    />
    <el-table-column align="right">
      <template #header>
        <el-button size="small" @click="o.add()">新增</el-button>
      </template>
      <template #default="scope">
        <el-button size="small"  @click="o.get(scope.row.id)">详情</el-button>
        <el-button size="small" @click="o.update(scope.row.id)">修改</el-button>
        <el-button size="small" type="danger" @click="o.del(`id=${scope.row.id}`)">删除</el-button>
      </template>
    </el-table-column>    
  </el-table>
</template>
