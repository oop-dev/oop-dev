import './assets/main.css'
//@ts-ignore
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App);
init(app)
app.config.globalProperties.has =has
app.use(router);
app.use(ElementPlus);
app.mount('#app');


























async function init(app) {
    const response = await fetch('http://localhost:3000/system/get', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });

    if (!response.ok) {
        throw new Error('Request failed');
    }
    let rsp=await response.json()
    app.config.globalProperties.classMap = rsp.classMap;
    localStorage.setItem('classMap', JSON.stringify(rsp.classMap));
    localStorage.setItem('menu', JSON.stringify(rsp.menu));
    localStorage.setItem('router', JSON.stringify(rsp.router));
    app.config.globalProperties.conf = {};
}
function has(perm) {
        let user=JSON.parse(localStorage.getItem('user'))
        let permissions=user?.role.flatMap(r=>r.permission)
        console.log('permissions',permissions)
        let has=permissions?.some(p => p.name == perm)
        console.log('perm',perm,'has',has)
        return has
}
