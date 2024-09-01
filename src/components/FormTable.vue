<script lang="ts" setup>
let prop=defineProps({clazz: '',list:[]})
let cols=JSON.parse(localStorage.getItem('classMap'))[prop.clazz]
</script>
<template>
  <el-table :data="list.filter(x=>!x.delete)" style="width: 100%">
    <el-table-column
        v-for="item in cols"
        :label="item.tag"
        :prop="item.col"
    >
      <template #default="scope">
        <el-input v-if="!scope.row['delete']" v-model="scope.row[item.col]" placeholder="请输入" />
      </template>
    </el-table-column>
    <el-table-column align="right">
      <template #header>
        <el-button size="small" @click="list.push({})">新增</el-button>
      </template>
      <template #default="scope">
        <!--        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
                  Edit
                </el-button>-->
        <el-button
            size="small"
            type="danger"
            @click="scope.row.delete=true"
        >
          Delete
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<style scoped>
/* 添加一些基本的样式 */
</style>
