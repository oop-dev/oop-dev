import {User} from "./api/User";
import {classMap} from "./sun.js";

//修改，变量类型获取用meta里面的type

function getsql(u) {
    let clazz=u.constructor.name.toLowerCase()
    let  where=Object.entries(u).filter(([key, value]) => value&&!Array.isArray(value)).map(([k,v])=>{
        if (typeof v!='object'){
            return `${clazz}.${k}='${v}'`
        }else {
            return getwhere(v)
        }
    }).flat().join(' and ')
    where=where||u.where
    where=where?`where ${where}`:''

    let  sel=Object.entries(u).filter(([key, value]) => !Array.isArray(value)).map(([k,v])=>{
        if (typeof v!='object'){
            return `${clazz}.${k} as ${clazz}.${k}`
        }else {
            return getsel(v)
        }
    })
    let  join=Object.entries(u).filter(([key, value]) => typeof value=='object').map(([k,v])=>{
        let son=v.constructor.name
        return [`left join ${son} p ON ${son}.${clazz}_id = ${clazz}.id`,...getjoin(v)]
    }).flat().join('\n')

    let sql=`select ${sel} from ${clazz} 
${join}
${where}`
    return sql
}
function getsel(u) {
    let clazz=u.constructor.name.toLowerCase()
    let  sel=Object.entries(u).filter(([key, value]) => !Array.isArray(value)).map(([k,v])=>{
        if (typeof v!='object'){
            return `${clazz}.${k} as ${clazz}.${k}`
        }else {
            return getsel(v)
        }
    })
    return sel
}
function getjoin(u) {
    let clazz=u.constructor.name.toLowerCase()
    let  join=Object.entries(u).filter(([key, value]) => typeof value=='object').map(([k,v])=>{
        let son=v.constructor.name
        return `left join ${son} p ON ${son}.${clazz}_id = ${clazz}.id`
    })
    return join
}
function getwhere(u) {//where和on都支持
    let clazz=u.constructor.name.toLowerCase()
    let  where=Object.entries(u).filter(([key, value]) => value&&!Array.isArray(value)).map(([k,v])=>{
        if (typeof v!='object'){
            return `${clazz}.${k}='${v}'`
        }else {
            return getwhere(v)
        }
    })
    return where
}
function addsql(pname,pid,u) {
    //1.执行自己，2.向下递归对象或者对象数组
    let clazz=u.constructor.name
    let sub=[]
    if (pid)u[pname]=pid
    let  values=Object.entries(u).filter(([k, v]) => {
        if (typeof v=='object'){sub.push(v)}
        return typeof v!='object'
    }).map(([k,v])=>{
        return v||'null'
    })
    let  keys=Object.entries(u).filter(([k, v]) => {
        if (typeof v=='object'){sub[k]=v}
        return typeof v!='object'
    }).map(([k,v])=>{
        return k||'null'
    })
    //执行sql获取id
    console.log(`insert into ${clazz} (${keys}) values(${values})`)
    let parentId=Math.random()
    sub.forEach(v =>Array.isArray(v)?v.forEach(v=>addsql(clazz,parentId,v)):addsql(clazz,parentId,v))
}

function updatesql(pname,pid,u) {
    let clazz=u.constructor.name
    let sub=[]
    if (pid)u[pname]=pid

    let  values=Object.entries(u).filter(([k, v]) => {
        if (typeof v=='object'){sub.push(v)}
        return v&&typeof v!='object'
    }).map(([k,v])=>{
        return `${k}=${v}`
    })
    let  where=Object.entries(u).filter(([key, value]) => value&&!Array.isArray(value)).map(([k,v])=>{
        if (typeof v!='object'){
            return `${clazz}.${k}='${v}'`
        }else {
            return getwhere(v)
        }
    }).flat().join(' and ')
    where=where||u.where
    where=where?`where ${where}`:''
    //执行sql获取id
    console.log(`update  ${clazz} set ${values} ${where}`)
    let parentId=Math.random()
    sub.forEach(v =>Array.isArray(v)?v.forEach(v=>updatesql(clazz,parentId,v)):updatesql(clazz,parentId,v))
}

function delsql(u) {
    let clazz=u.constructor.name
    let  where=Object.entries(u).filter(([key, value]) => value&&typeof value != 'object'&& key != 'where').map(([k,v])=>{
        if (typeof v=='string'){
            return `${k}='${v}'`
        }else if (typeof v=='number') {
            return `${k}=${v}`
        }
    }).join(' and ')
    where=where||u.where
    where=where?`where ${where}`:''

    let sql=`delete from ${clazz} ${where}`
    return sql
}

function gen(u) {
    //克隆classMap
    let body=Object.entries(u).map(([k,v])=> {
        console.log(k, v)
        if (k == 'id') {
            return `id SERIAL PRIMARY KEY`
        }else if (typeof v=='object'){
            return `${k} int`
        }else if (typeof v=='string'){
            return `${k} varchar`
        }else if (typeof v=='number'){
            return `${k} DOUBLE PRECISION,`
        }else if (typeof v=='bigint'){
            return `${k} bigint`
        }
    })
    return `create table ${u.constructor.name} (${body});`
}
let users=new User()
users.id=0
users.username='test'
console.log(users.app?'you':'wu')
console.log(users)
console.log(gen(users))
