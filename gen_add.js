
async function gen() {
    let name='orders'
    let nameLow=name.toLowerCase()
    let fn='add'
    const page = `<script setup lang="ts">
import { New } from "../../../FrontProxy";
import { Orders } from "../../../api/Orders";
const o = New(Orders);
</script>
<template>
  <el-form ref="formRef" :model="o" label-width="auto">
    <view v-for="{ col, tag, sel, radio, check,show } in o.cols()">
      <el-form-item v-if="show?.[0]=='1'"  :label="tag" :key="col">
        <el-select v-if="sel" v-model="o[col]" :placeholder="tag">
          <el-option
              v-for="(item, index) in sel"
              :key="index"
              :label="item"
              :value="index"
          />
        </el-select>

        <el-radio-group v-else-if="radio" v-model="o[col]">
          <el-radio
              v-for="(item, index) in radio"
              :key="index"
              :value="index"
              size="large"
          >
            {{ item }}
          </el-radio>
        </el-radio-group>

        <el-checkbox-group v-else-if="check" v-model="o[col]">
          <el-checkbox
              v-for="(item, index) in check"
              :key="index"
              :label="item"
              :value="index"
          />
        </el-checkbox-group>

        <el-input v-else v-model="o[col]" />
      </el-form-item>
    </view>
    <view style="display: flex; justify-content: space-between;" >
      <el-button @click="()=>{}" type="primary" plain>重置</el-button>
      <el-button @click="o.add()" type="primary" plain>添加</el-button>
    </view>
  </el-form>
</template>

`
    await Bun.write(`src/views/${nameLow}/${fn}.vue`, page);
}
gen()
