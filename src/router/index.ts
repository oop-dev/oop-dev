// @ts-ignore
import {createRouter, createWebHistory, type Router} from 'vue-router'
import Login from "../views/login.vue";
import Home from "../views/home.vue";
import Dash from "../views/dash.vue";
import Test from "../views/test.vue";

let children=[
    {
        path: 'dash',
        name: 'dash',
        component: Dash
    },
    {
        path: 'test',
        name: 'test',
        component: Test
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
    // @ts-ignore
    let pages=import.meta.glob(`../views/**/*.vue`)
    console.log(pages)
    Object.entries(pages).forEach(([k,v])=>{
        if (!['../views/home.vue','../views/login.vue','../views/dash.vue'].includes(k)){
            children.push({
                path: convertPathToString(k),
                name: convertPathToString(k),
                // @ts-ignore
                component: v
            });
        }
    })
    console.log(list)
    router = createRouter({
        // @ts-ignore
        history: createWebHistory(import.meta.env.BASE_URL),
        // @ts-ignore
        routes: list
    })
    return router
}
function convertPathToString(filePath: string, prefixToRemove?: string): string {
    prefixToRemove='../views/'
    // 去除文件扩展名
    const fileNameWithoutExtension = filePath.replace(/\.[^/.]+$/, "");

    // 去除指定的前缀
    const pathWithoutPrefix = fileNameWithoutExtension.startsWith(prefixToRemove)
        ? fileNameWithoutExtension.substring(prefixToRemove.length)
        : fileNameWithoutExtension;

    // 替换路径分隔符为点分隔符
    const formattedString = pathWithoutPrefix
        .replace(/\/+|\\+/g, '/')
        .replace(/^\.+|\.+$/g, ''); // 去除开头和结尾的点

    return formattedString;
}
