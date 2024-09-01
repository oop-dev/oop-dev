import {readdir} from "node:fs/promises";
import {migrateSql, New, NewBase} from "./BaseProxy.ts";
import {Base} from "./Base";
import {migrate} from "./migrate";
let data = await import('./conf.toml')
export const conf =  data;
if (!data.appid){
    let ts='oop_'+Date.now()
    let  f=await Bun.file("conf.toml")
    f.writer().write(`appid='${ts}'\n`+await f.text());
    await migrateSql(`CREATE USER ${ts} WITH PASSWORD '${ts}';`)
    await migrateSql(`CREATE DATABASE ${ts} OWNER ${ts};`)
    await migrateSql(`REVOKE CONNECT ON DATABASE ${ts} FROM PUBLIC;`)
    await migrateSql(`GRANT CONNECT ON DATABASE ${ts} TO ${ts};`)
    await migrateSql(`ALTER DATABASE ${ts} OWNER TO ${ts};`)
}


export const classMap = {}
await loadClass()
console.log(classMap)
//migrate page and table
migrate(classMap)
Bun.serve({
    port: conf.port,
    async fetch(r) {
        let rid=Date.now()
        try {
            if (r.method == "OPTIONS"){return Rsp(204, '',rid)}

            const path = new URL(r.url).pathname;
            console.log(path,conf.auth,conf.blacklist.includes(path),await r.headers.get('Authorization'),await verifyToken(r.headers.get('Authorization')))
            if (conf.auth && !conf.blacklist.includes(path) && !(await verifyToken(r.headers.get('Authorization')))) {
                return Rsp(401, '请登录',rid)
            }
            let data = await r.json()
            //data.rid=rid 设置到meta里面
            let [a, clazz, fn] = path.split('/')
            //console.log(rid,'req:',data)
            let {obj,req} = createInstanceAndReq(clazz, data)
            let rsp = await obj[fn](req)
           // console.log(rid,'rsp:',rsp)
            return Rsp(200, rsp,rid);
        } catch (e) {
            let msg = typeof e == 'string' ? e : e.message
            console.error('msg:', msg);
            console.error('stack:', e.stack);
            return Rsp(555, msg,rid)
        }
    }
});
console.log(`Listening on ${conf.port}`);

function Rsp(code, data,rid) {
    let rsp = Response.json(data, {status: code});
    rsp.headers.set('Access-Control-Allow-Origin', '*');
    rsp.headers.set('Access-Control-Allow-Methods', '*');
    rsp.headers.set('Access-Control-Allow-Headers', '*');
    rsp.headers.set('rid', rid)
    if (typeof data == 'string' && data.startsWith('http')) {
        rsp = new Response('', {status: 302});
        rsp.headers.set('Location', res);
    }
    return rsp
}
async function sha256(message) {
    // 将字符串编码为 Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // 计算 SHA-256 哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // 将 ArrayBuffer 转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}
function base64(input) {
    // 将输入字符串转换为 Buffer 对象，并编码为 Base64
    return Buffer.from(input).toString('base64');
}

// Base64 解码函数
function deBase64(encoded) {
    // 将 Base64 编码的字符串转换为 Buffer 对象，并解码为 UTF-8 字符串
    return Buffer.from(encoded, 'base64').toString('utf-8');
}
export async function jwtToken(obj) {
    const sign = await sha256(JSON.stringify(obj))
    let jwt={payload:obj,sign:sign}
    let jwtToken=base64(JSON.stringify(jwt))
    console.log('jwtToken',jwtToken)
    return jwtToken
}
export async function verifyToken(token){
    if (!token)return false
    let jwt=JSON.parse(deBase64(token))
    console.log('jwt',jwt)
    return token==await jwtToken(jwt.payload)
}

async function loadClass() {
    for (const item of await readdir('./api', {recursive: true})) {
        console.log('item',item)
        const module = await import(`./api/${item}`);
        console.log('module',module)
        let className = item.replace(".ts", "")
        // @ts-ignore
        classMap[className.toLowerCase()] = module[className]
    }
}

export function createInstance(className, json) {
    const Class = classMap[className];
    if (!Class) {
        throw new Error(`${className} not found`);
    }
    Object.setPrototypeOf(Class.prototype, NewBase(Base));//代理父类增删改查
    let obj=New(Class)//代理子类，子类没重写增删改查，调用父类代理的增删改查,重写了调用子类


    Object.entries(obj).forEach(([k,v])=>{
        if (json[k]&&Array.isArray(v)){
            obj[k]=v.map(v=>createInstance(k,json[k]))
        }else if (json[k]&&typeof v=='object'){
            obj[k]= createInstance(k,json[k])
        }else if (json?.[k]) {
            console.log(k)
            obj[k]=json?.[k]
        }
    })
    obj['select']=json?.['select']
    return obj;
}
export function createInstanceAndReq(className, json) {
    const Class = classMap[className];
    if (!Class) {
        throw new Error(`${className} not found`);
    }
    Object.setPrototypeOf(Class.prototype, NewBase(Base));//代理父类增删改查
    let obj=New(Class)//代理子类，子类没重写增删改查，调用父类代理的增删改查,重写了调用子类


    Object.entries(obj).forEach(([k,v])=>{
        if (json[k]&&Array.isArray(v)){//可能是对象数组，可能是普通数组
            obj[k]=json?.[k].map(v=>typeof v=='object'?createInstance(k,json[k]):v)
        }else if (json[k]&&typeof v=='object'){
            obj[k]= createInstance(k,json[k])
        }else if (json?.[k]) {
            console.log(k)
            obj[k]=json?.[k]
        }
        delete json[k]
    })
    obj['select']=json?.['select']
    return {obj,req:json};
}
