import {classMap,conf} from "./oapi";
import {Base} from "./Base";
import {migrateSql} from "./Base";
let fs = null
if (typeof window=='undefined'){
    fs = require('node:fs')
}
let base={list:true,on:true,select:true,where:true}
let parseMap={}
export function migrate(classMap) {
    Object.entries(classMap).forEach(([k,v])=>{
        let o=new classMap[k]()
        if (!o.col){return }
        gen(o,null,0)//数据库类表迁移
        //迁移页面
        gen_gets(o,'gets')
        gen_add(o,'add')
        gen_update(o,'update')
        gen_get(o,'get')
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
    // @ts-ignore
    Promise.all(Object.values(parseMap).map(sql=>migrateSql(sql))).then(()=>{
        migrateSql(`SELECT EXISTS(SELECT 1 FROM "user" WHERE id = 1)`).then(rs=>{
            if (rs.rows[0].exists){return}
            migrateSql(`insert into "permission" (name)values ('*')`)
            migrateSql(`insert into "role" (name, permission)values ('admin','{1}')`)
            migrateSql(`insert into "user" (name, pwd, role)values ('admin','ebbe8eaa32232299659e8e49d942dc72fd835daf37f43f7cca6112ee7c8e5db2','{1}')`)
        })
    })
}
function gen(u:Base<any>,pname,tp) {
    //克隆classMap
    let clazz=u.constructor.name.toLowerCase()
    if (parseMap[clazz]&&tp==0)return //已经存在的只能更新
    parseMap[clazz]=true
    let body=[]

    body=Object.entries(u).filter(([k, v]) =>{
        if (base[k]){return false}
        if (typeof v=='object'&&!['n1','nn'].includes(u.col(k)?.link)){
            gen(new classMap[k](),clazz,1)
            return false
        }
        return true
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
        // @ts-ignore
        body=[...new Set(body)]
    }
    let sql=`create table if not exists "${clazz}" (${body});`
    parseMap[clazz]=sql
    return sql
}

async function gen_get(o,fn) {
    let name=o.constructor.name
    let f=`src/views/${name.toLowerCase()}/${fn}.vue`
    if (fs.existsSync(f))return
    let cols=o.cols()
    let selMap={}
    let selclass=Object.keys(cols).filter(x=>typeof o[x]=="object"&&cols[x].sel)
    // @ts-ignore
    selclass=selclass.map(x=>{
        selMap[x]=x
        return `import {${upper(x)}} from "../../../api/${upper(x)}"
let ${x}=new ${upper(x)}()
${x}.gets()`}).join('')

    let nameLow=name.toLowerCase()
    const page = `<script setup lang="ts">
import {${name}} from "../../../api/${name}";
import FormTable from "@/components/FormTable.vue";
import FormTableItem from "@/components/FormTableItem.vue";
import { useRoute } from 'vue-router';
let o=new ${name}()
o.get(useRoute().query.id)
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
  </el-form>
</template>
`
    let dir=`src/views/${nameLow}`
    if(!fs.existsSync(dir)){ fs.mkdirSync(dir)}
    await fs.writeFileSync(`src/views/${nameLow}/${fn}.vue`, page);
}
async function gen_gets(o,fn) {
    let name=o.constructor.name
    let nameLow=name.toLowerCase()
    let f=`src/views/${name.toLowerCase()}/${fn}.vue`
    if (fs.existsSync(f))return
    const page = `<script setup lang="ts">
import {${name}} from "../../../api/${name}";
import {to} from "@/router";
let o=new ${name}()
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
`
    let dir=`src/views/${nameLow}`
    if(!fs.existsSync(dir)){ fs.mkdirSync(dir)}
    await fs.writeFileSync(`src/views/${nameLow}/${fn}.vue`, page);
}
function upper(str) {
    if (!str) return str;  // 处理空字符串
    return str.charAt(0).toUpperCase() + str.slice(1);
}
async function gen_update(o,fn) {
    let name=o.constructor.name
    let f=`src/views/${name.toLowerCase()}/${fn}.vue`
    if (fs.existsSync(f))return
    let cols=o.cols()
    let selMap={}
    let selclass=Object.keys(cols).filter(x=>typeof o[x]=="object"&&cols[x].sel)
    // @ts-ignore
    selclass=selclass.map(x=>{
        selMap[x]=x
        return `import {${upper(x)}} from "../../../api/${upper(x)}"
let ${x}=new ${upper(x)}()
${x}.gets()`}).join('')

    let nameLow=name.toLowerCase()
    const page = `<script setup lang="ts">
import { New } from "../../../VueProxy";
import {${name}} from "../../../api/${name}";
import FormTable from "@/components/FormTable.vue";
import FormTableItem from "@/components/FormTableItem.vue";
import { useRoute } from 'vue-router';
let o=new ${name}()
o.get(useRoute().query.id)
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
    let dir=`src/views/${nameLow}`
    if(!fs.existsSync(dir)){ fs.mkdirSync(dir)}
    await fs.writeFileSync(`src/views/${nameLow}/${fn}.vue`, page);
}
async function gen_add(o,fn) {
    let name=o.constructor.name
    let f=`src/views/${name.toLowerCase()}/${fn}.vue`
    if (fs.existsSync(f))return
    let cols=o.cols()
    let selMap={}
    let selclass=Object.keys(cols).filter(x=>typeof o[x]=="object"&&cols[x].sel)
    // @ts-ignore
    selclass=selclass.map(x=>{
        selMap[x]=x
        return `import {${upper(x)}} from "../../../api/${upper(x)}"
let ${x}=new ${upper(x)}()
${x}.gets()
`}).join('')

    let nameLow=name.toLowerCase()
    const page = `<script setup lang="ts">
import {${name}} from "../../../api/${name}";
import FormTable from "@/components/FormTable.vue";
import FormTableItem from "@/components/FormTableItem.vue";
let o=new ${name}()
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
    let dir=`src/views/${nameLow}`
    if(!fs.existsSync(dir)){ fs.mkdirSync(dir)}
    await fs.writeFileSync(`src/views/${nameLow}/${fn}.vue`, page);
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
    return asyncFunctionNames;
}
