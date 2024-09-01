import {Base} from "../Base";
import {classMap} from "../sun";
import {Orders} from "./Orders";
// @ts-ignore
//type number string sel radio check text date date_range
//tag 中文
//link 11,1n,n1,nn,前两个默认子指向父亲，后两个显示申明父持有子
export class System extends Base {
    // @ts-ignore
    async get() {
        //模拟数据库查询，super.get()，super.get是base dao的数据库增删改查接口，根据this参数自动查询
        console.log('get order')
        let clazz={}
        let menu={}
        Object.keys(classMap).forEach(k=>{
            console.log(k)
            let o=new classMap[k]()
            clazz[k]=o.cols()
            menu[k]=o.constructor.menu
        })
        console.log(clazz)

        const importPromises = Object.keys(classMap).filter(x=>x!='system').map(async (k) => {
            return getMethodNames(new classMap[k]());
        });
        const routers = await Promise.all(importPromises);
        return {classMap:clazz,menu:menu,router:routers}
    }
    async routes() {
        //模拟数据库查询，super.get()，super.get是base dao的数据库增删改查接口，根据this参数自动查询
        console.log('get order')
        let rsp=[]
        Object.keys(classMap).forEach(k=>{
            console.log(k)
            rsp.push(...[...new Set(getMethodNames(new Orders()))])
        })
        console.log(rsp)
        return rsp
    }
}
function getMethodNames(obj) {
    let clazz = obj.constructor.name.toLowerCase()
    let asyncMethods = [];
    let currentObj = obj;

    do {
        const props = Object.getOwnPropertyNames(currentObj);
        props.forEach(prop => {
            const descriptor = Object.getOwnPropertyDescriptor(currentObj, prop);
            if (descriptor && typeof descriptor.value === 'function' && descriptor.value.constructor.name === 'AsyncFunction') {
                asyncMethods.push(prop);
            }
        });
        currentObj = Object.getPrototypeOf(currentObj);
    } while (currentObj && currentObj !== Object.prototype);
    asyncMethods=[...new Set(asyncMethods)]
    console.log(asyncMethods)
    return asyncMethods.map(x => {
            //x=x=='get'?'':x
            let name=x?'/'+x:x
            return {
                path: `${clazz}/${x}`,
                name: `${clazz}/${x}`,
                component: () => import(`../views/${clazz}/${x}.vue`)
            }
        }
    );
}
function upper(str) {
    if (!str) return str;  // 处理空字符串
    return str.charAt(0).toUpperCase() + str.slice(1);
}
