# oop-dev
oop-dev，面向对象开发平台，是首个用面型对象形式，云对象+odb对象数据库的全栈开发的web框架，这里一切都是对象操作， 包括前端，
http接口，vo，数据库操作全是面向对象方式操作，打破原有前端，http，后端，vo，数据库等开发的概念，
以面向对象的形式更优雅，更高效地去开发全栈，提高10倍生产力
## 快速开始
```sh
git clone https://github.com/oop-dev/oop-dev.git
```

## 环境安装  
### bun安装:目前仅支持bun，为serverless冷启动必须小于50毫秒和ts考虑，当node支持ts时，考虑node.js，bun是兼容node的
```sh
linux: curl -fsSL https://bun.sh/install | bash
win: powershell -c "irm bun.sh/install.ps1 | iex"
```
### 依赖安装
```sh
pnpm i  #推荐使用pnpm，npm，cnpm，bun都哦可以安装依赖
```

### 数据库：项目启动自动分配独立云pg数据库，不用云db把conf.toml中dsn替换即可
```
[pg]
dsn='postgres://postgres:root@localhost:5432/odb'
```

## 运行
```sh
bun run start
访问：http://localhost:5173 用户名admin密码admin
非mock模拟数据，这是一个完整的全栈项目，api目录是后端，登录conf.toml分配的云数据库，可查看数据
```


## api后端：api目录下所有类是云对象,super是odb操作数据库增删改查，以下是云对象+数据库增删改查示例
gets，get，add，update，del继承了base可以不用写的，也可以覆盖重写base增删改查
数据库表：项目启动api目录下所有云对象自动迁移成数据库表，开源登录分配的pg数据库查看
```
import {Base, Col, Menu} from "../node_modules/oop-core/Base";
export class Permission extends Base<Permission> {
    @Col({tag: '名称', type: '', filter: true, show: '1111'})//1111代表增删改查是否显示
    name = ''
    async gets() {
        return await super.gets()
    }
    async get(id) {
        return await super.get(id)
    }
    async update(id) {
        return await super.update(id)
    }
    async del(id) {
        return await super.del(id)
    }
}
``` 
## 前端实现：权限的云对象调用o.getpage(1,size)，实现分页查询，请求的数据属于对象，自动刷新到对象，更新到页面
```
<script setup lang="ts">
import {Permission} from "../../../api/Permission";
import {to} from "@/router";
let o=new Permission()
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

```
## odb教程：对象操作+静态操作两种方式
## 增
```
super.add()  #插入数据，支持嵌套，一个add可以插入所有嵌套子表
关联插入：自动插入所有子表，包括n层嵌套，属性link的11,1n,n1,nn关系代表子表数据，所有的关联自动关联插入
```
## 删
```
super.del(id)   #根据id删除
super.del(where)   #根据条件删除
```
## 改
```
super.update(where) #修改，
关联插入：自动修改所有子表，包括n层嵌套，属性link的11,1n,n1,nn关系代表子表数据，所有的关联自动关联更新
```
## 查
```
通过id查询:super.get(id)
通过条件查询:super.get(where)
n表关联查询:super.sel('*').wh(where).get(where) 第一个where是单表独立条件，第二个where是多表关联结果集的条件
属性link的11,1n,n1,nn关系代表子表数据，所有的关联自动联查
以下等价5表联查，用户，用户角色，角色，角色权限，权限
this.sel("id","name","pwd","role").role=new Role().sel("id","name","permission")
let user=await super.get(1) #//查询用户id为1的用户信息，角色信息，权限信息，详情看api/User云对象，登录实现
```
## 其他api引入，如User查id为1的权限
```
let p=new Permission()
p.get(1)
或者静态使用
let p=permission.get(1)
```
## 云对象注解说明
```
@Menu("商家")
export class Merchant extends Base<Merchant> {
    @Col({tag:'名称',type:'',filter:true,show:'1111',link:'n1'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'余额',show:'1111',link:'sstr'})//rstr
    balance=0//支持11,1n,n1,nn,前两个默认子指向父亲，后两个显示申明父持有子
    @Col({tag:'区域经理',sel:[],link:'n1',show:'1111'})//1111代表增删改查是否显示
    manager=new Manager()
    @Col({tag:'订单',link:'1n',show:'0111'})//1111代表增删改查是否显示
    order=[]
    @Col({tag:'应用',link:'1n',show:'1111'})//1111代表增删改查是否显示
    app=[]
    async gets() {
        return await super.gets()
    }
}
tag：字段的说明，表单表格显示用
filter：列表页筛选数据
show：1111代表增删改查页面是否显示该列
sel：表单用下拉框输入，['男','女']，如果是对象类型，自动查库渲染到下拉框
link：11,1n,n1,nn代表对象1对1，1对多，多对1，多对多关系
```
## 云对象拦截器：run(intercepter)
```
详情查看index.ts
```
## 前端说明
```
路由：页面就是路由，无需配置
菜单:云对象@Menu代表菜单
数据更新:云对象请求，响应结果属云对象，数据自动赋值给云对象，自动更新到页面
```
## 小程序
```
小程序采用uni，也可以用云对象，uni目录就是，即将开放
```
