<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Role} from "../../../api/Role";
import {New} from "../../../VueProxy";
let o=New(Role)
o.size=10
o.page=1
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
  <el-pagination  @current-change="page=>{o.page=page;o.gets()}" background layout="prev, pager, next" :page-size="10" :total="1000" />
</template>
