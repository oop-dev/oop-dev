<script setup lang="ts">
import {CloudObj} from "../../../api/CloudObj";
import FormTable from "@/components/FormTable.vue";
import FormTableItem from "@/components/FormTableItem.vue";
import { useRoute } from 'vue-router';
let o=new CloudObj()
o.get(useRoute().query.id)

let selMap={}
</script>
<template>
  <el-form ref="formRef" :model="o" label-width="auto">
    <view v-for="{ col, tag, sel, radio, check,show } in o.cols()">
      <el-form-item v-if="show?.[0]=='1'"  :label="tag" :key="col">
      
        <el-select v-if="sel&&Array.isArray(o[col])" v-model="o[col]" multiple :placeholder="tag">
          <el-option
              v-for="(item, index) in selMap[col].list"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>      
      
        <el-select v-else-if="sel&&typeof o[col]=='object'" v-model="o[col]"  :placeholder="tag">
          <el-option
              v-for="(item, index) in selMap[col].list"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>      
      
        <el-select v-else-if="sel" v-model="o[col]" :placeholder="tag">
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
        <FormTable :clazz="col" :list="o[col]"  v-else-if='Array.isArray(o[col])'></FormTable>
        <FormTableItem :clazz="col" :obj="o[col]"  v-else-if='typeof o[col]==`object`'></FormTableItem>
        <el-input v-else v-model="o[col]" />
      </el-form-item>
    </view>
  </el-form>
</template>
