import {createRouter, createWebHistory, type Router} from 'vue-router'
import Login from "../views/login.vue";
import Home from "@/views/home.vue";
import Dash from "@/views/dash.vue";

let children=[
    {
        path: 'dash',
        name: 'dash',
        component: Dash
    },
]
let list = [
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/',
        name: 'home',
        component: Home,
        children: children
    },
]

let router:Router
export default router
export async function to(name: string,id:number) {
    router.push(id?name+`?id=${id}`:name);
}
function extractFileName(url) {
    const regex = /\/([^\/]+)\.vue/;
    const match = url.match(regex);
    if (match) {
        // Extract the file name without extension
        return match[1];
    }
    return null;
}
function upper(str) {
    if (!str) return str;  // 处理空字符串
    return str.charAt(0).toUpperCase() + str.slice(1);
}
export async function getRouter(){
    // 等待所有模块导入完成，并将结果合并到 children 数组中
    const resultArrays =JSON.parse(localStorage.getItem('router')).flat()
    resultArrays.forEach(x=>{
        let [clazz,fn]=x.name.split('/')
        x['component']=() => import(`../views/${clazz}/${fn}.vue`)
    })
    console.log('resultArrays',resultArrays)
    console.log('resultArrays',resultArrays)
    children.push(...resultArrays);
    console.log('list',list)
    router = createRouter({
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: list
    })
    return router
}
