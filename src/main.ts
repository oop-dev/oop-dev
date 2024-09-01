import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router, {getRouter} from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 异步数据获取函数
async function get(url:string) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });

    if (!response.ok) {
        throw new Error('Request failed');
    }

    return response.json();
}

// 应用初始化函数
async function run() {
    const app = createApp(App);

    try {
        // 异步获取数据
        const rsp = await get('http://localhost:3000/system/get');

        // 设置全局属性
        app.config.globalProperties.classMap = rsp.classMap;
        localStorage.setItem('classMap', JSON.stringify(rsp.classMap));
        localStorage.setItem('menu', JSON.stringify(rsp.menu));
        localStorage.setItem('router', JSON.stringify(rsp.router));
        app.config.globalProperties.test = 'Hello, World!111';
        app.config.globalProperties.conf = {};
        app.config.globalProperties.has = (perm)=>{
            let user=JSON.parse(localStorage.getItem('user'))
            let permissions=user?.role.flatMap(r=>r.permission)
            console.log('permissions',permissions)
            let has=permissions?.some(p => p.name == perm)
            console.log('perm',perm,'has',has)
            return has
        };

        // 注册插件
        app.use(await getRouter());
        app.use(ElementPlus);

        // 挂载应用
        app.mount('#app');
    } catch (error) {
        console.error('Failed to initialize the app:', error);
    }
}

// 调用初始化函数
run();
