import {post, get} from './axios';
import {Reactive, reactive, ref} from "vue"; // 引入配置好的 Axios 实例
import { ElMessage } from 'element-plus'
import  {to} from "@/router";
export function New<T>(clazz: new (...args: any[]) => T, id?): Reactive<T> {
    // @ts-ignore
    let obj = new clazz()
    Object.keys(obj).forEach(k=>{
        if(typeof obj[k]=='number'){
            obj[k]=undefined
        }
    })
    obj.constructor.metadata = JSON.parse(localStorage.getItem('classMap'))[obj.constructor.name.toLowerCase()]
    let proxy = new Proxy(obj, {
        get(target, property, receiver) {
            // 保留父类方法名称
            console.log('sdfasdfsad',target.add.name)


            let className = target.constructor.name.toLowerCase()
            //get页面调用其他方法，代表跳转其他方法对应页面
            const error = new Error();
            const stack = error.stack || '';
            console.log('fileName',stack.includes('get.vue'))
            console.log('target',target.list)
            //console.log('receiver',receiver.list)
            if ((property=='add'||property=='update'||property=='get')&&property&&stack.includes('gets.vue')&&property!='gets'&& property != 'cols'&&typeof target[property] === 'function'){
                return async (...args) => {
                    console.log('fsdf',args[0])
                    to(property,args[0])
                }
            }else if (!target.list&&property == 'list'||property=='gets') {
                obj.list=[]
                let {list,...data}=target
                gets(receiver,className,'gets',data)
            } else if (typeof target[property] === 'function' && property != 'cols') {
                return async (...args) => {
                    // @ts-ignore
                    target.where=args[0]
                    let {list,on,select,...data}=target
                    let rsp=await post('/' + className + '/' + property, data)
                    //如果是改请求是页面路由，或者增删改查，自动跳转到get页面
                    if (property=='add'||property=='update'){
                        to('gets')
                    }else if (property=='del'){
                        target.where=''
                        receiver.where=''
                        let {list,on,select,...data}=target
                        gets(receiver,className,'gets',data)
                    }
                    return rsp
                };
            } else if (typeof target[property] === 'function' && property == 'cols') {
                return () => target.constructor.metadata
            }
            return Reflect.get(target, property, receiver);
        }
    })
    console.log('sdfasdfsad',proxy.add.name)

    proxy =reactive(proxy)
    if (id) {
        get(proxy,clazz.name.toLowerCase(),'get',id)
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

