import {classMap} from "./sun";
import {Base} from "./Base";
import {migrateSql} from "./BaseProxy";
let base={list:true,on:true,select:true,where:true}
let pmap={}
let parseMap={}
function gen(u:Base<any>,pname,tp) {
    //克隆classMap
    let clazz=u.constructor.name.toLowerCase()
    if (parseMap[clazz]&&tp==0)return //已经存在的只能更新
    parseMap[clazz]=true
    let body=[]

     body=Object.entries(u).filter(([k, v]) =>{
        if (u.col(k)?.link=='1n'){
            gen(new classMap[k](),clazz,1)
        }
        return !base[k]&&u.col(k)?.link!='1n'
    }).map(([k,v])=> {
        if (k == 'id') {
            return `id SERIAL PRIMARY KEY`
        }else if (Array.isArray(v)){
            return `"${k}" integer []`
        }else if (typeof v=='object'){
            return `"${k}" integer`
        }else if (u.col(k)?.type=='int'){
            return `"${k}" integer`
        }else if (typeof v=='string'){
            return `"${k}" varchar`
        }else if (typeof v=='number'){
            return `"${k}" double precision`
        }
    }).filter(v=>u!=undefined||u!=undefined)
    if (pname){
        body.push(`"${pname}" integer`)
    }
    let sql=`create table if not exists "${clazz}" (${body});`
    parseMap[clazz]=sql
    return sql
}
export function migrate(classMap) {
    Object.entries(classMap).forEach(([k,v])=>{
        let o=new classMap[k]()
        gen(o,null,0)//数据库类表迁移
        //迁移页面
        gen_get(o,'gets')
        gen_other(o,'add')
/*        console.log(Object.keys(o))
        listAsyncFunctionNames(o).forEach(x=>{
            console.log( x)
            if (x=='get'){
                gen_get(o ,x)
            }else {
                gen_other(o,x)
            }
        })*/
    })
    console.log(parseMap)
    Object.values(parseMap).forEach(sql=>migrateSql(sql))

}

async function gen_get(o,fn) {
    let name=o.constructor.name
    let nameLow=name.toLowerCase()
    const page = `<script setup lang="ts">
import {onMounted, ref} from "vue";
import {${name}} from "../../../api/${name}";
import {New} from "../../../VueProxy";
//后续会自动根据o对象生成
let o=New(${name})//New(Orders,1) 两种方式，默认获取空对象，传id获取该id的对象，列表是渲染o.list时获取
//let name=Orders.name.toLowerCase()
let name='${nameLow}'
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
        <el-button size="small" type="danger" @click="o.del(\`id=\${scope.row.id}\`)">删除</el-button>
      </template>
    </el-table-column>    
  </el-table>
</template>
`
    await Bun.write(`src/views/${nameLow}/${fn}.vue`, page);
}
function upper(str) {
    if (!str) return str;  // 处理空字符串
    return str.charAt(0).toUpperCase() + str.slice(1);
}
async function gen_other(o,fn) {
    let name=o.constructor.name
    let cols=o.cols()
    let selMap={}
    let selclass=Object.keys(cols).filter(x=>typeof o[x]=="object"&&cols[x].sel)
    selclass=selclass.map(x=>{
        selMap[x]=x
        return `import {${upper(x)}} from "../../../api/${upper(x)}"
let ${x}=New(${upper(x)})
`
    }).join('')

    console.log('selclass',selclass)
    let nameLow=name.toLowerCase()
    const page = `
    <script setup lang="ts">
import { New } from "../../../VueProxy";
import {${name}} from "../../../api/${name}";
import FormTable from "@/components/FormTable.vue";
import FormTableItem from "@/components/FormTableItem.vue";
let o=New(${name})
${selclass}
let selMap={${Object.entries(selMap).map(([k,v])=>`${k}:${v}`)}}
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
        <FormTableItem :clazz="col" :obj="o[col]"  v-else-if='typeof o[col]==\`object\`'></FormTableItem>
        <el-input v-else v-model="o[col]" />
      </el-form-item>
    </view>
    <view style="display: flex; justify-content: space-between;" >
      <el-button @click="" type="primary" plain>重置</el-button>
      <el-button @click="o.${fn}()" type="primary" plain>提交</el-button>
    </view>
  </el-form>
</template>
`
    await Bun.write(`src/views/${nameLow}/${fn}.vue`, page);
}
// 定义一个返回异步函数名称数组的函数
function listAsyncFunctionNames(obj: object): string[] {
    let asyncFunctionNames: string[] = [];

    // 获取对象的原型链
    let prototype = Object.getPrototypeOf(obj);

    // 遍历原型链
    while (prototype !== null) {
        const propertyNames = Object.getOwnPropertyNames(prototype);

        for (let key of propertyNames) {
            const property = (prototype as any)[key];

            if (typeof property === 'function') {
                if (property.toString().startsWith('async function')) {
                    asyncFunctionNames.push(key);
                }
            }
        }

        prototype = Object.getPrototypeOf(prototype);
    }

    // 处理实例属性上的函数
    for (let key in obj) {
        if (typeof (obj as any)[key] === 'function') {
            const func = (obj as any)[key];
            if (func.toString().startsWith('async function') || func.toString().startsWith('async ()')) {
                asyncFunctionNames.push(key);
            }
        }
    }
    console.log(asyncFunctionNames)
    return asyncFunctionNames;
}
