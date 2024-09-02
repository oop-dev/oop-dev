import {createRouter, createWebHistory, type Router} from 'vue-router'
import Login from "../views/login.vue";
import Home from "../views/home.vue";
import Dash from "../views/dash.vue";

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
initRouter()
export default router
export async function to(name: string,id:number) {
    router.push(id?name+`?id=${id}`:name);
}

export function initRouter(){
    // 等待所有模块导入完成，并将结果合并到 children 数组中
    let resultArrays =[]
    while (!localStorage.getItem('router')){}
    resultArrays =JSON.parse(localStorage.getItem('router')).flat()
    resultArrays.forEach(x=>{
        let [clazz,fn]=x.name.split('/')
        x['component']=() => import(`../views/${clazz}/${fn}.vue`)
    })
    children.push(...resultArrays);

    router = createRouter({
        // @ts-ignore
        history: createWebHistory(import.meta.env.BASE_URL),
        // @ts-ignore
        routes: list
    })
    return router
}
