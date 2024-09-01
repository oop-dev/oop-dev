import {Reactive, reactive, ref} from "vue"; // 引入配置好的 Axios 实例
export function New<T>(clazz: new (...args: any[]) => T, id?): Reactive<T> {
    // @ts-ignore
    let obj = new clazz()
    Object.keys(obj).forEach(k=>{
        if(typeof obj[k]=='number'){
            obj[k]=null
        }
    })
    obj.list=[]
    //obj.constructor.metadata = JSON.parse(localStorage.getItem('classMap'))[obj.constructor.name.toLowerCase()]
    let proxy = new Proxy(obj, {
        get(target, property, receiver) {
            let className = target.constructor.name.toLowerCase()
            //get页面调用其他方法，代表跳转其他方法对应页面
            const error = new Error();
            const stack = error.stack || '';
            console.log('fileName',stack.includes('get.vue'))
            if (stack.includes('get.vue')&&property!='get'&& property != 'cols'&&typeof target[property] === 'function'){
                return
            }else if (target.list.length==0&&property == 'list'||property=='get') {
                let {list,...data}=target
                gets(target,className,'get',data)
            } else if (typeof target[property] === 'function' && property != 'cols') {
                return async (...args) => {
                    // @ts-ignore
                    let {list,on,select,where,...data}=target
                    let rsp=await post('/' + className + '/' + property, data)
                    return rsp
                };
            } else if (typeof target[property] === 'function' && property == 'cols') {
                return () => target.constructor.metadata
            }
            return Reflect.get(target, property, receiver);
        }
    })
    proxy =reactive(proxy)
    if (id) {
        get(proxy,clazz.name.toLowerCase(),'info',1)
    }
    return proxy
}

async function get(proxy,clazz,fn,id) {
    let rsp=await post('/' + clazz + '/' + fn, {id:id})
    Object.assign(proxy, rsp)
}
async function gets(proxy,clazz,fn,data) {
    let rsp=await post('/' + clazz + '/' + fn, data)
    proxy.list=rsp
}
// 通过代理对象访问属性和方法时，将获得类型提示
// utils/request.js
export async function post(url, data, header = {}) {
    try {
        const response = await new Promise((resolve, reject) => {
            uni.request({
                url:'http://localhost:3000'+url,
                method: 'POST',
                data,
                header,
                success: (res) => resolve(res),
                fail: (err) => reject(err),
            });
        });

        return response.data;
    } catch (error) {
        console.error('请求失败', error);
        throw error; // 可根据需要处理错误
    }
}
