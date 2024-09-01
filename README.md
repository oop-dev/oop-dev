# oop-dev
oop-dev，面向对象开发平台，是首个用面型对象形式，全栈开发的web框架，这里一切都是对象操作， 包括前端，
http接口，vo，数据库操作全是面向对象方式操作，打破原有前端，http，后端，vo，数据库等开发的概念，
以面向对象的形式更优雅，更高效地去开发全栈，提高10倍生产力

## 快速开始
```sh
git clone https://github.com/oop-dev/vue.git
```

## 环境安装  
### bun安装:目前仅支持bun，为serverless冷启动必须小于50毫秒考虑，后续考虑node.js
```sh
linux: curl -fsSL https://bun.sh/install | bash
win: powershell -c "irm bun.sh/install.ps1 | iex"
```
### 依赖安装
```sh
bun add
```

## 运行
```sh
bun run start
结果:前后端项目同时启动，这里没有前后端的概念了，这里只有对象
Listening on 3000
Local:   http://localhost:5173
```

## 实现后端：api目录创建Merchant类，get1是获取数据接口，add1是添加接口
```
import {Base, log, Meta} from "../Base";
export class Merchant extends Base {
    metadata: any
    @Meta({type: 'string', lable: 'id', valid: {rule: '', msg: ''}})
    id: string
    @Meta({type: 'string', lable: '名称', require: true, valid: {rule: '', msg: ''}})
    name: string
    @Meta({type: 'string', lable: '押金', require: true, valid: {rule: '', msg: ''}})
    deposit: number
    async get1() {
        //模拟数据库查询，super.get()，super.get是base dao的数据库增删改查接口，根据this参数自动查询
       return [{id:'fdsag',name:'asfdf'}]
    }
    async add1() {
        //this是前端传来的参数，也是操作添加方法的对象
        console.log(this)
        //模拟数据库，super.add() ，添加成功，super.add是base dao的数据库增删改查接口
        return '添加成功'
    }
}
``` 
## 实现前端去http概念：o.get1或o.list自动调用对象get1方法，o.add自动调用后端o.add
```
<script setup lang="ts">
import {onMounted} from "vue";
import {New} from "../../FrontProxy";
import {Merchant} from "../../api/Merchant";
//后续会自动根据o对象生成
const columns = [
  { label: '商户id', prop: 'id' },
  { label: '名称', prop: 'name' },
]
let o=New(Merchant)
let list=[]
onMounted( async ()=>{
  list=await o.get1()
})

</script>
<template>
  <el-form :model="o" label-width="auto" style="max-width: 600px">
    <el-form-item label="商家名称">
      <el-input v-model="o.name" />
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="o.pwd" />
    </el-form-item>
  </el-form>
  <el-table  :data="o.list" style="width: 100%">
    <el-table-column fiexd
                     v-for="column in columns"
                     :key="column.prop"
                     :label="column.label"
                     :prop="column.prop"
                     :align="column.align || 'left'"
    />
  </el-table>
  <el-button @click="o.add1()" type="primary" plain style="margin-left: 10px ">添加</el-button>
</template>
```
## 访问前端页面，发现前后显示出了接口数据，点添加接口也提示添加成功，注意观察后端this就是前端传参
```
我们用对象操作方式实现了接口，并没有写任何js代码，
查询接口:o.get1()自动获取了数据
新增接口:o.add()，自动把表单数据绑定到o对象上，调用了后端o.add()，参数就是this
```

## oop思想，去除接口概念
```
一切参数由用户传递，表单就是对象对象再带方法，是表单自己操作自己，
而非前端通过http传递给后端，减少对接成本，减少对接错误
```


## 去除vo和去orm概念
```
一切都是对象操作，复杂数据是嵌套对象，而不是vo转换，然后falt扁平化成多个dao对象，然后多次操作db
举例：
多表添加：一次对象操作，而非vo转换成merchant表，和多个app表，多次操作
o.add({name:'m1',pwd:'m1',app:[
{app_name:'app1',ak:'tear1',sk:'tewar1'},
{app_name:'app2',ak:'tear2',sk:'tewar2'}
]})

多表查询：不需要merchant表和app表关联查询，merchant包含app，获取商家对象，自动获取下级对象
o.gets()  o.get()  o的属性就是条件
```
## 框架在更新中，时间紧迫，后续继续完善oop面向对象操作数据库的文档
