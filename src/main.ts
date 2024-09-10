import './assets/main.css'
//@ts-ignore
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { ElMessage } from 'element-plus'
const app = createApp(App);
init(app)
app.config.globalProperties.has =has

app.use(router);
app.use(ElementPlus);
app.mount('#app');

window.addEventListener("unhandledrejection", e => {
    ElMessage({
        // @ts-ignore
        message: e.reason,
        type: 'error',
        plain: true,
    })
})

async function init(app) {
    let url=import.meta.env.VITE_BASE_URL
    const response = await fetch(`${url}/system/get`, {
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
        if (perm=='*'){
            return true
        }
        let user=JSON.parse(localStorage.getItem('user'))
        let permissions=user?.role.flatMap(r=>r.permission)
        console.log('permissions',permissions)
        let has=permissions?.some(p =>['*',perm].includes(p.name))
        console.log('perm',perm,'has',has)
        return has
}
