<script lang="ts" setup>
import {onMounted, ref} from "vue";

let prop=defineProps({clazz: '',list:[]})
let cols=ref({})
function upper(str) {
  if (!str) return str;  // 处理空字符串
  return str.charAt(0).toUpperCase() + str.slice(1);
}
onMounted(async ()=>{
  delete cols['id']
  console.log(111111,prop.clazz)
  let m=await import(`../../api/${upper(prop.clazz)}`)
  let o= new m[`${upper(prop.clazz)}`]()
  cols.value=o.cols()
  delete cols.value['id']
  console.log('o',o.cols())
})
</script>
<template>
  <el-table :data="list.filter(x=>!x.delete)" style="width: 100%">
    <el-table-column
        v-for="{ col, tag, sel, radio, check,show } in cols"
        :label="tag"
        :prop="col"
    >
      <template #default="scope">
        <el-select v-if="sel" v-model="scope.row[col]" :placeholder="tag">
          <el-option
              v-for="(item, index) in sel"
              :key="index"
              :label="item"
              :value="index"
          />
        </el-select>
        <el-input v-else v-model="scope.row[col]" placeholder="请输入" />
<!--        <el-input v-if="!scope.row['delete']" v-model="scope.row[col]" placeholder="请输入" />-->
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
