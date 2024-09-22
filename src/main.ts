import './assets/main.css'
//@ts-ignore
import { createApp } from 'vue'
import App from './App.vue'
//@ts-ignore
import router from './router'
//@ts-ignore
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//@ts-ignore
import { ElMessage } from 'element-plus'
const app = createApp(App);
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
