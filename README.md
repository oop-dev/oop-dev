# 官网文档:http://oop-dev.com
# oop-dev简介
全球首个面向对象的全栈开发框架,基于vue+bun.js+postgre,云对象，对象数据库，实现的全栈开发，这里没有http,接口, sql,vo,三层架构等概念，
云对象+odb实现快速开发，解放生产,以下用最少的代码完成一个齐全的管理系统
## 快速开始
````bash
git clone https://github.com/oop-dev/oop-dev.git
````
## 环境安装
bun安装:目前仅支持bun，为serverless冷启动速度和ts考虑，当node支持ts时，考虑node.js，不用担心了，bun是兼容node的
````bash
linux: curl -fsSL https://bun.sh/install | bash
win: powershell -c "irm bun.sh/install.ps1 | iex"
````
## 依赖安卓
````bash
pnpm i  #推荐使用pnpm，npm，cnpm，bun都可以安装依赖,可能要node环境
````
## 数据库
项目启动自动分配独立云pg数据库，不用云db把conf.toml中dsn替换即可
````conf.toml
[pg]
dsn='postgres://postgres:root@localhost:5432/odb'
````
## 运行
非mock模拟数据，这是一个完整的全栈项目，api目录是后端，登录conf.toml分配的云数据库，可查看数据库数据
````bash
bun run start
访问：http://localhost:5173/login 用户名admin密码admin
````
