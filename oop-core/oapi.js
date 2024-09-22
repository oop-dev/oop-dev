import {initdb} from "./Base.ts";
const mimeTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'json': 'application/json',
    'woff': 'application/font-woff',
    'woff2': 'application/font-woff2',
    'ttf': 'application/font-sfnt',
    'ico': 'favicon.ico'
}
let fs, migrateSql ,Base ,migrate ,config ,path;

if (typeof window=='undefined'){
    path='./'  // 同步./是根目录，异步是当前目录
    fs = require('node:fs/promises');
    config = toml(path);
    migrateSql = require('./Base.ts').migrateSql;
    Base = require('./Base.ts').Base.ts;
    migrate= require('./migrate').migrate;
}
export const conf=config
export const classMap = {}

export async function run(intercepter) {
    if (!conf.pg) {
        let name = UUID()
        let pwd = UUID()
        let db = UUID()
        let dsn=`postgres://${name}:${pwd}@www.oop-dev.com:5432/${db}`
        fs.appendFile(`${path}conf.toml`,`[pg]\ndsn='${dsn}'\n`);
        let rsp=await fetch('http://www.oop-dev.com/db/addUserAndDb', {
            method: 'POST', // 指定请求方法
            headers: {
                'Content-Type': 'application/json' // 设置请求的Content-Type
            },
            body: JSON.stringify({name,pwd,db}) // 将数据转换为JSON字符串
        })
        conf.pg= {dsn:dsn}
    }
    initdb()
    await loadClass()
    //migrate page and table
    migrate(classMap)
    if (conf.runtime=='bun'){
        bun_run(intercepter)
    }else {
        node_run()
    }
}

export function Rsp(code, data, rid='') {
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

async function loadClass() {
    const fs = require('fs')
    for (const item of  fs.readdirSync(`${path}api`)) {
        const module = await import(/* @vite-ignore */`../api/${item}`);
        let className = item.replace(".ts", "")
        // @ts-ignore
        classMap[className.toLowerCase()] = module[className]
    }
}

export function createInstance(className, data) {
    const Class = classMap[className];
    if (!Class) {
        throw new Error(`${className} not found`);
    }
    let obj = new Class()//代理子类，子类没重写增删改查，调用父类代理的增删改查,重写了调用子

    Object.entries(obj).forEach(([k, v]) => {
        if (data?.[k] && Array.isArray(v)) {//可能是对象数组，可能是普通数组
            obj[k] = data?.[k].map(v => typeof v == 'object' ? createInstance(k, v) : v)
        } else if (data?.[k] && typeof v == 'object') {
            //是id直接赋值
            obj[k] =typeof data[k]=='object'?createInstance(k, data[k]):data[k]
        } else if (data?.[k]) {
            //解决sql注入
            if (typeof data?.[k] =="string"){
                data[k]=data?.[k].replaceAll(`'`,`"`)
            }
            obj[k] = data?.[k]
        }
    })
    return obj;
}

export function createInstanceAndReq(className, json) {
    const Class = classMap[className];
    if (!Class) {
        throw new Error(`${className} not found`);
    }
    //Object.setPrototypeOf(Class.prototype, NewBase(Base));//代理父类增删改查
    let obj = new Class()//代理子类，子类没重写增删改查，调用父类代理的增删改查,重写了调用子类
    let args
    if (Array.isArray(json)){
        const [data, ...params] = json; // 使用扩展运算符来获取剩余元素
        Object.entries(obj).forEach(([k, v]) => {
            if (data[k] && Array.isArray(v)) {//可能是对象数组，可能是普通数组
                obj[k] = data?.[k].map(v => typeof v == 'object' ? createInstance(k, v) : v)
            } else if (data[k] && typeof v == 'object') {
                //是id直接赋值
                obj[k] =typeof data[k]=='object'?createInstance(k, data[k]):data[k]
            } else if (data?.[k]) {
                //解决sql注入
                if (typeof data?.[k] =="string"){
                    data[k]=data?.[k].replaceAll(`'`,`"`)
                }
                obj[k] = data?.[k]
            }
            delete data[k]
        })
        args=params?.[0]?params:[data]
    }else {
        Object.entries(obj).forEach(([k, v]) => {
            if (json[k] && Array.isArray(v)) {//可能是对象数组，可能是普通数组
                obj[k] = json?.[k].map(v => typeof v == 'object' ? createInstance(k, json[k]) : v)
            } else if (json[k] && typeof v == 'object') {
                obj[k] = createInstance(k, json[k])
            } else if (json?.[k]) {
                if (typeof json?.[k] =="string"){
                    json[k]=json?.[k].replaceAll(`'`,`"`)
                }
                obj[k] = json?.[k]
            }
            delete json[k]
        })
        args=[json]
    }
    return {obj, args: args};
}
function UUID() {
    const timestamp = Date.now().toString(36); // 使用36进制转换时间戳
    const randomPart = Math.random().toString(36).substring(2, 10); // 随机数的一部分，转换为36进制并取前9位
    return `${timestamp}${randomPart}`;
}
function toml(path) {
    //path=path.replaceAll(`file:///`,'')
    const fs=require('fs')
    const toml=require('toml')
    const tomlFileContent = fs.readFileSync(`${path}conf.toml`, 'utf-8');
    return  toml.parse(tomlFileContent);
}
export  function getJwt(token) {
    return JSON.parse(deBase64(token))
}
export async function jwtToken(obj) {
    const sign = await sha256(JSON.stringify(obj))
    let jwt={payload:obj,sign:sign}
    return base64(JSON.stringify(jwt))
}
export async function verifyToken(token){
    if (!token)return false
    let jwt=JSON.parse(deBase64(token))
    return token==await jwtToken(jwt.payload)
}
export async function sha256(message) {
    // 将字符串编码为 Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message+conf.secret);

    // 计算 SHA-256 哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // 将 ArrayBuffer 转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}
export function base64(input) {
    // 将输入字符串转换为 Buffer 对象，并编码为 Base64
    return Buffer.from(input).toString('base64');
}
export function deBase64(encoded) {
    // 将 Base64 编码的字符串转换为 Buffer 对象，并解码为 UTF-8 字符串
    return Buffer.from(encoded, 'base64').toString('utf-8');
}

async function bun_run(intercepter) {
    Bun.serve({
        port: conf.port,
        async fetch(r) {
            let rid = Date.now()
            try {
                //data.rid=rid 设置到meta里面
                const path = new URL(r.url).pathname;
                if (r.method == "OPTIONS") {
                    return Rsp(204, '', rid)
                }
                if (path=='favicon.ico'){
                    return new Response(Bun.file('dist/favicon.ico'));
                }
                if (path == '/') {//单页应用只能/访问
                    return new Response(Bun.file('dist/index.html'));
                }
                //@ts-ignore 判断mime文件类型代表是静态资源，
                let split = path.split('.')
                let suffix = split[split.length - 1]
                if (mimeTypes[suffix]) {
                    return new Response(Bun.file(`dist` + path));
                }
                if (intercepter){
                    let rsp=await intercepter(r)
                    if (rsp){return rsp}
                }
                let data={}
                if (r.method == "POST") {
                    data = await r?.json()||{}
                }
                let [a, clazz, fn] = path.split('/')
                //console.log(rid,'req:',data)
                let {obj, args} = createInstanceAndReq(clazz, data)
                if (!obj[fn])throw 'method not found'
                let rsp = await obj[fn](...args,r)
                if (rsp instanceof Response){
                    return  rsp
                }
                return Rsp(200, rsp, rid);
            } catch (e) {
                let msg = typeof e == 'string' ? e : e.message
                console.error('msg:', msg);
                console.error('stack:', e.stack);
                return Rsp(500, msg, rid)
            }
        }
    });
    console.log(`Listening on ${conf.port}`);
}
async function node_run(intercepter) {
    let http = require('http')
    let url = require('url')
    let querystring = require('querystring')
    const server = http.createServer(async (r, w) => {
        try {
            w.setHeader('Access-Control-Allow-Origin', '*');
            w.setHeader('Access-Control-Allow-Methods', '*');
            w.setHeader('Access-Control-Allow-Headers', '*');
            if (r.method=="OPTIONS"){
                w.writeHead(204); // 无内容响应
                w.end();
                return;
            }
            let path=url.parse(r.url).pathname
            if (path=="/favicon.ico"){
                w.writeHead(200); // 无内容响应
                w.end(await fs.readFile('dist/favicon.ico'));
                return;
            }
            if (path == '/') {//单页应用只能/访问
                w.writeHead(200, {'Content-Type': 'text/html'});
                // If the file is found, set Content-type and send data
                w.end(await fs.readFile('dist/index.html'));
                return;
            }
            //@ts-ignore 判断mime文件类型代表是静态资源，
            let split = path.split('.')
            let suffix = split[split.length - 1]
            if (mimeTypes[suffix]) {
                //判断mime type静态文件类型
                let {parse}=await import('path')
                const ext = parse(path).ext.replace(`.`,'');
                //根据文件后缀类型返回对应格式的文件，如js，还是html，还是图片
                w.writeHead(200, {'Content-Type': mimeTypes[ext]});
                w.end(await fs.readFile(`dist` + path));
                return;
            }
            if (intercepter){
                let rsp=await intercepter(r,w)
                if (rsp){return rsp}
            }
            let data={}
            if (r.method=="GET"){
                data=await getQuery(r.url)
            }else {
                data=await getRequestBody(r)
            }
            let [a, clazz, fn] = path.split('/')
            //console.log(rid,'req:',data)
            let {obj, args} = createInstanceAndReq(clazz, data)
            if (!obj[fn])throw 'method not found'
            let rsp = await obj[fn](...args,r)
            if (typeof rsp =='string'&&rsp.startsWith('http')){
                w.writeHead(302, { 'Location': `${rsp}`});
                w.end();
                return
            }
            w.writeHead(200, {'Content-Type': 'application/json'});
            w.end(JSON.stringify(rsp));
        }catch (e) {
            console.log('error:', e.message?e.message:e);
            console.log('stack:', e.stack);
            w.writeHead(500, {'Content-Type': 'text/plain;charset=utf-8'});
            w.end(e.message?e.message:e);
        }
    });
    const port = conf.port;
    server.listen(port, () => {
        console.log(`Listening on ${conf.port}`);
    });
}
function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString(); // 将数据块转换为字符串并拼接
        });

        req.on('end', () => {
            resolve(body?JSON.parse(body):{}); // 请求体完全接收后，解析为字符串
        });

        req.on('error', (err) => {
            reject(err); // 处理请求体接收错误
        });
    });
}
// 示例 URL
async function getQuery(urlString) {
    let url = require('url')
    let querystring = require('querystring')
    const parsedUrl = url.parse(urlString);
    const queryParams = querystring.parse(parsedUrl.query);
    return queryParams
}
