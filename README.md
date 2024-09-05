# oop-dev
oop-dev，面向对象开发平台，是首个用面型对象形式，全栈开发的web框架，这里一切都是对象操作， 包括前端，
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

### 安装postgre数据库，然后配置conf.toml密码pg的dsn
```
[pg]
dsn='postgres://postgres:root@localhost:5432/odb'
```

## 运行
```sh
bun run start
结果:前后端项目同时启动，这里没有前后端的概念了，这里只有云对象
Listening on 3000
Local:   http://localhost:5173
```
## 说明
```
1.动态路由，文件夹就是路由，不需要配置
2.菜单，@menu('权限即可')
3.项目启动自动迁移api下所有云对象到pg数据库表，和前端增删改查页面
4.接口，请使用云对象代替接口
5.vo请使用云对象嵌套形式代替vo
6.sql,使用odb对象数据库操作代替sql，避免多表嵌套增删改查麻烦
```
## 访问 http://localhost:5173
```sh
用户名admin
密码 admin
```
## 实现后端：api目录创建Permission类，gets是获取数据接口，super.gets是操作数据库，base默认实现了增删改查，这几个可以不写
以下该云方法对应：http://3000/permission/gets,前端请使用云对象，云方法而非接口
```
import {Base,Col,Menu} from "../node_modules/oop-core/Base";
@Menu('权限')
export class Permission extends Base<Permission> {
    @Col({tag:'名称',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    // 后端接口
    async gets() {
     // super.gets()查询数据库，base默认实现了gets，get，add，update，del，这几个云方法可以不写
     return await super.gets()
    }
}
``` 
## 实现前端去http概念：o.gets或o.list自动调用对象gets云方法(http)，其他页面o.add，o.update自动调用云方法(http)
以下o.list或者o.gets云方法调用会对应发起http://3000/permission/gets请求
```
<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Permission} from "../../../api/Permission";
import {New} from "../../../VueProxy";
let o=New(Permission)
o.size=10
o.page=1
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
        <el-button size="small" type="danger" @click="o.del(`id=${scope.row.id}`)">删除</el-button>
      </template>
    </el-table-column>    
  </el-table>
  <el-pagination  @current-change="page=>{o.page=page;o.gets()}" background layout="prev, pager, next" :page-size="10" :total="1000" />
</template>
```
