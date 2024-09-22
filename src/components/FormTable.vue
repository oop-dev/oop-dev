<script lang="ts" setup>
import {onMounted, ref} from "vue";

let prop=defineProps({clazz: '',list:[]})
let cols=ref({})
function upper(str) {
  if (!str) return str;  // 处理空字符串
  return str.charAt(0).toUpperCase() + str.slice(1);
}
onMounted(async ()=>{
  console.log(111111,prop.clazz)
  let m=await import(`../../api/${upper(prop.clazz)}`)
  let o= new m[`${upper(prop.clazz)}`]()
  cols.value=o.cols()
  console.log('o',o.cols())
})
delete cols['id']
console.log(cols)
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
