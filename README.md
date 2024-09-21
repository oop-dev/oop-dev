# 简介
oop-dev全球首个用面型对象，云对象+odb对象数据库的全栈开发的web框架,这里没有http,接口,
sql,vo,三层架构等概念,云对象+odb实现快速开发,提升10倍生产力
## 快速开始
````bash
git clone https://github.com/oop-dev/oop-dev.git
````
## 环境安装
````bash
node.js去官网安装
````
## 依赖安装
````bash
npm i  #推荐使用pnpm，cnpm，bun都可以
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
npm run dev
访问：http://localhost:5173/login 用户名admin密码admin
````

# bun.js环境支持（以下可选）
## bun.js安装
````bash
linux: curl -fsSL https://bun.sh/install | bash
win: powershell -c "irm bun.sh/install.ps1 | iex"
````
## 配置
conf.toml中修改runtime
````conf.toml
runtime='bun'
````
package.json中修改end后端启动命令
````package.json
"end": "bun run index.ts"
````
