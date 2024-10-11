<script setup lang="ts">
import {Order} from "../../../api/Order";
import {to} from "@/router";
let o=new Order()
let size=10
o.getpage(1,size)
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
        <el-button size="small" @click="to('add')">新增</el-button>
      </template>
      <template #default="scope">
        <el-button size="small"  @click="to('get',scope.row.id)">详情</el-button>
        <el-button size="small" @click="to('update',scope.row.id)">修改</el-button>
        <el-button size="small" type="danger" @click="o.del(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>    
  </el-table>
  <el-pagination  @current-change="page=>{o.getpage(page,size)}" background layout="prev, pager, next" :page-size="size" :total="o.total" />
</template>
