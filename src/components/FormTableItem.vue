<script lang="ts" setup>
import {onMounted, ref} from "vue";

let prop=defineProps({clazz: '',obj: {}})
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
