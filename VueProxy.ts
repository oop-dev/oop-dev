// @ts-ignore
import {Reactive, reactive, ref} from "vue"; // 引入配置好的 Axios 实例
import { ElMessage } from 'element-plus'
// @ts-ignore
import router, {to} from "@/router/index"
export const post = async (url, data, header?) => {
    try {
        // 创建完整的请求 URL
        const requestUrl = 'http://localhost:3000/' + url;
        // 创建请求配置
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')||'',
                ...header // 合并额外的配置
            },
            body: JSON.stringify(data) // 将数据对象转换为 JSON 字符串
        };

        // 发送请求
        const response = await fetch(requestUrl, requestOptions);

        // 检查响应状态
        if (!response.ok) {
            // 如果响应状态不是 2xx，抛出错误
            const errorData = await response.json();
            if (response.status === 401) {
                console.log('401---');
                // 在 401 错误时重定向到登录页
                window.location.href = '/login';
            }
            ElMessage({
                // @ts-ignore
                message: errorData,
                type: 'error',
                plain: true,
            });
            throw errorData;
        }

        // 解析响应数据
        const responseData = await response.json();
        return responseData;

    } catch (error) {
        console.log('res-----', error);
        throw error;
    }
};

export function New<T>(clazz: new (...args: any[]) => T, id?): Reactive<T> {
    // @ts-ignore
    let obj = new clazz()
    Object.keys(obj).forEach(k=>{
        if(typeof obj[k]=='number'){
            obj[k]=undefined
        }
    })
    // @ts-ignore
    obj.constructor.metadata = JSON.parse(localStorage.getItem('classMap'))[obj.constructor.name.toLowerCase()]
    // @ts-ignore
    let proxy = new Proxy(obj, {
        get(target, property, receiver) {
            if (typeof target[property] === 'function' && property == 'sel'){
                return Reflect.get(target, property, receiver);
            }
            // 保留父类方法名称
            let className = target.constructor.name.toLowerCase()
            //get页面调用其他方法，代表跳转其他方法对应页面
            const error = new Error();
            const stack = error.stack || '';
            // @ts-ignore
            if (typeof target[property] === 'function' && property == 'cols') {
                // @ts-ignore
                return () => target.constructor.metadata
            }else if (typeof target[property] === 'function'&&property&&stack.includes('gets.vue')&&(property=='add'||property=='update'||property=='get')){
                return async (...args) => {
                    to(property,args[0])
                }
                // @ts-ignore
            }else if (!target.list&&property=='list'||property=='gets') {
                // @ts-ignore
                target.list=[]
                // @ts-ignore
                let {list,...data}=target
                gets(receiver,className,'gets',data)
                return
            }else if (typeof target[property] === 'function') {
                return async (...args) => {
                    // @ts-ignore
                    target.on=args[0]
                    // @ts-ignore
                    let {list,...data}=target
                    // @ts-ignore
                    let rsp=await post(className + '/' + property, data)
                    //如果是改请求是页面路由，或者增删改查，自动跳转到get页面
                    if (property=='add'||property=='update'){
                        to('gets')
                    }else if (property=='del'){
                        // @ts-ignore
                        target.on=''
                        receiver.on=''
                        // @ts-ignore
                        let {list,on,select,...data}=target
                        gets(receiver,className,'gets',data)
                    }else if (property=='gets'){
                        receiver.list=rsp
                    }
                    return rsp
                };
            }
            return Reflect.get(target, property, receiver);
        }
    })
    proxy =reactive(proxy)
    if (id) {
        get(proxy,clazz.name.toLowerCase(),'get',id)
    }
    // @ts-ignore
    return proxy
}

async function get(proxy,clazz,fn,id) {
    let rsp=await post(clazz + '/' + fn, {id:id})
    Object.assign(proxy, rsp)
}
async function gets(proxy,clazz,fn,data) {
    let rsp=await post(clazz + '/' + fn, data)
    proxy.list=rsp
}

