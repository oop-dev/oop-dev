import {Pool} from "pg";
import {classMap,createInstance} from "./sun";
import {Base} from "./Base";

// 创建一个连接池
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'root',
    database: 'odb',
    port: 5432,
    max: 10, // 连接池中最大的连接数
    idleTimeoutMillis: 300000, // 30秒内未被使用的连接将被关闭
    connectionTimeoutMillis: 3000, // 2秒内无法建立连接则报错
});
export function NewBase<T>(clazz: new (...args: any[]) => T): T {
    // @ts-ignore
    return new Proxy(new clazz(), {
        get(target, property, receiver) {
            let className = receiver.constructor.name
            if (property === 'get') {
                console.log('super')
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    console.log('name',receiver.name)
                    console.log('args',args)
                    const conn = await pool.connect(); // 从连接池获取一个客户端连接
                    try{
                        let parseMap = {}
                        return await get(receiver, conn, parseMap,isEmptyObject(args[0])?undefined:args[0])
                    }catch (e) {
                        throw e
                    }finally {
                        conn.release(); // 释放客户端连接，返回连接池
                        console.log('release')
                    }
                    // 不执行原始方法
                };
            }
            // 您可以在这里自定义代理行为
            if (property === 'gets') {
                console.log('super')
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    console.log('name',receiver.name)
                    console.log('args',args)
                    const conn = await pool.connect(); // 从连接池获取一个客户端连接
                    try{
                        let parseMap = {}
                        return await gets(receiver, conn, parseMap,isEmptyObject(args[0])?undefined:args[0])
                    }catch (e) {
                        throw e
                    }finally {
                        conn.release(); // 释放客户端连接，返回连接池
                        console.log('release')
                    }
                    // 不执行原始方法
                };
            }
            if (property === 'add') {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    const conn = await pool.connect(); // 从连接池获取一个客户端连接
                    try {
                        await conn.query('BEGIN'); // 开始事务
                        await add(null, null, receiver, conn)
                        await conn.query('COMMIT'); // 提交事务
                        console.log('Transaction committed successfully');
                    } catch (err) {
                        await conn.query('ROLLBACK'); // 事务回滚
                        console.log('Transaction rolled back due to error:', err);
                        throw err
                    } finally {
                        conn.release(); // 释放客户端连接，返回连接池
                        console.log('release')
                    }
                    return null
                };
            }
            if (property === 'update') {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    const conn = await pool.connect(); // 从连接池获取一个客户端连接
                    try {
                        await conn.query('BEGIN'); // 开始事务
                        await update(null, null, receiver, conn)
                        await conn.query('COMMIT'); // 提交事务
                        console.log('Transaction committed successfully');
                    } catch (err) {
                        await conn.query('ROLLBACK'); // 事务回滚
                        console.log('Transaction rolled back due to error:', err);
                        throw err
                    } finally {
                        conn.release(); // 释放客户端连接，返回连接池
                        console.log('release')
                    }
                    return null
                };
            }
            if (property === 'del') {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    const conn = await pool.connect(); // 从连接池获取一个客户端连接
                    try {
                        await conn.query('BEGIN'); // 开始事务
                        await del( receiver, conn,isEmptyObject(args[0])?undefined:args[0])
                        await conn.query('COMMIT'); // 提交事务
                        console.log('Transaction committed successfully');
                    } catch (err) {
                        await conn.query('ROLLBACK'); // 事务回滚
                        console.log('Transaction rolled back due to error:', err);
                        throw err
                    } finally {
                        conn.release(); // 释放客户端连接，返回连接池
                        console.log('release')
                    }
                    return null
                };
            }
            return Reflect.get(target, property, receiver);
        }
    })
}
// 创建 EdgeDB 客户端实例
export function New<T>(clazz: new (...args: any[]) => T): T {
    // @ts-ignore
    return new Proxy(new clazz(), {
        get(target, property, receiver) {
            let className = target.constructor.name
            const own = Object.getOwnPropertyDescriptor(target, property)
            // 您可以在这里自定义代理行为
            if (property === 'get'&&!target[property]) {
                console.log('super')
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    const conn = await pool.connect(); // 从连接池获取一个客户端连接
                    let parseMap = {}
                    return await get(target, conn, parseMap,isEmptyObject(args[0])?undefined:args[0])
                    // 不执行原始方法
                };
            }
            if (property === 'add'&&!target[property]) {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    const conn = await pool.connect(); // 从连接池获取一个客户端连接
                    try {
                        await conn.query('BEGIN'); // 开始事务
                        await add(null, null, target, conn)
                        await conn.query('COMMIT'); // 提交事务
                        console.log('Transaction committed successfully');
                    } catch (err) {
                        await conn.query('ROLLBACK'); // 事务回滚
                        console.log('Transaction rolled back due to error:', err);
                        throw err
                    } finally {
                        conn.release(); // 释放客户端连接，返回连接池
                        console.log('release')
                    }
                    return null
                };
            }
            if (property === 'update'&&!target[property]) {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    return await update(null, null, target)
                };
            }
            if (property === 'del'&&!target[property]) {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    return await del(target)
                };
            }
            return Reflect.get(target, property, receiver);
        }
    })
}
function nest(data, clazz) {
    console.log(data)
    const m = {};
    const rootMap = {};
    data.forEach(item => {
        let obj = create(clazz, item, m,{})
        rootMap[obj.id] = obj
    })
    return Object.values(rootMap)
}

function create(clazz, row, m,parseMap) {
    parseMap[clazz]=true
    let id = row[`${clazz}_id`]
    let obj = m[`${clazz}_${id}`]
    if (!obj) {
        obj = new classMap[clazz]()
        m[`${clazz}_${id}`] = obj
    }
    delete obj.on
    delete obj.select
    delete obj.where
    delete obj.list
    Object.entries(obj).filter(([k,v])=>!base[k]).forEach(([k, v]) => {
        if (v&&Array.isArray(v)&&!parseMap[k]) {//解决重复赋值和循环依赖
            let obj = create(k, row, m,parseMap)
            console.log(parseMap)
            if (row[k+'_id']&&!v.some(role => role?.id == row[`${k}_id`])) {//数组不需要处理循环依赖
                console.log(k,v)
                v.push(obj);
            }else {
                obj[k]=null
            }
        } else if (v&&typeof v == 'object') {//解决重复赋值和循环依赖
            //console.log(parseMap[k]?`循环依赖${k}`:`${k},raer`)
            console.log('has',row[k+'_id'])
            if (row[k+'_id']&&!v?.id&&!parseMap[k]){
                //console.log(parseMap[k]?`w循环依赖${k}`:`${k},w raer`)
                obj[k]=create(k, row, m,parseMap)
            }else {
                obj[k]=null
            }
        } else {
            obj[k] = row?.[`${clazz}_${k}`]
        }
    })
    return obj
}

let base={list:true,on:true,select:true,where:true}
async function get(u, conn, parseMap,where?) {
    let list=await await gets(u, conn, parseMap,where)
    return list[0]
}
async function gets(u, conn, parseMap,where?) {
    console.log('where,',where)
    let clazz = u.constructor.name.toLowerCase()
    parseMap[clazz] = true
    where=where|| Object.entries(u).filter(([key, value]) =>!base[key]&&value && typeof value!='object').map(([k, v]) => {
        console.log('kkkkk',k)
        if (typeof v != 'object') {
            return `"${clazz}".${k}='${v}'`
        } else if (u.select.includes(k)){
            return getwhere(v)
        }
    }).filter(item => item !== undefined).flat().join(' and ')
    where = where || u.where
    where = where ? `where ${where}` : ''
    console.log('where----------',JSON.stringify(where))
    console.log('sel----------',JSON.stringify(u.select))
    if (!u.select||u?.select?.length==0){u.select=['*']}
    let sel = Object.entries(u).filter(([k, v]) =>u.select&&!base[k]&& !parseMap[k]).map(([k, v]) => {
        console.log(k,v)
        if (typeof v != 'object'&&(u.select.includes(k)|u.select.includes('*'))) {
            console.log(typeof v,k,v)
            return `"${clazz}".${k} as ${clazz}_${k}`
        } else if (u.select.includes(k)) {
            let s=getsel(createInstance(k,v), parseMap)
            console.log('roles----------',s)
            return s
        }
    }).filter(item => item !== undefined)
    console.log('sel----------',JSON.stringify(u.select))

    let join = Object.entries(u).filter(([key, value]) =>u.select&&u.select.includes(key)&&value&& key!='list'&&typeof value == 'object'&&!parseMap[key]).map(([k, v]) => {
        let son = k
        let rootjoin=''
        if (u.col(k)?.link == 'n1'){
            rootjoin=`left join ${k} on "${clazz}".${k} = ${k}.id`
        }else if (u.col(k)?.link == 'nn'){
            rootjoin=`left join lateral unnest("${clazz}".${k}) AS ${k}_id ON true JOIN ${k}  ON ${k}.id = ${k}_id`
        }else {
            rootjoin=`left join ${son}  ON ${son}.${clazz} = ${clazz}.id`
        }
        return [rootjoin, ...getjoin(v,parseMap)]
    }).flat().join('\n')

    let sql = `select ${sel}
                   from "${clazz}" ${join} ${where}`
    console.log('sql',sql)
    let rs = await conn.query(sql)
    console.log(rs.rows)
    return nest(rs.rows, clazz)
}

function getsel(u, parseMap) {
    console.log('select----------',u)
    let clazz = u.constructor.name.toLowerCase()
    if (!u.select||u?.select?.length==0){u.select=['*']}
    let sel = Object.entries(u).filter(([k, v]) =>!base[k]&&!parseMap[k]).map(([k, v]) => {
        if (typeof v != 'object'||!v) {
            return `${clazz}.${k} as ${clazz}_${k}`
        } else if (u.select.includes(k)) {
            return getsel(createInstance(k,v), parseMap)
        }
    }).filter(item => item !== undefined)
    return sel
}

function getjoin(u,parseMap) {
    let clazz = u.constructor.name.toLowerCase()
    parseMap[clazz] = true
    let join = Object.entries(u).filter(([key, value]) =>!base[key]&&u.select.includes(key)&&typeof value == 'object'&&!parseMap[key]).map(([k, v]) => {
        let son = v.constructor.name
        let rootjoin=''
        if (u.col(k)?.link == 'n1'){
            rootjoin=`left join ${k} on ${clazz}.${k} = ${k}.id`
        }else if (u.col(k)?.link == 'nn'){
            rootjoin=`left join lateral unnest(${clazz}.${k}) AS ${k}_id ON true JOIN ${k}  ON ${k}.id = ${k}_id`
        }else {
            rootjoin=`left join ${son}  ON ${son}.${clazz} = ${clazz}.id`
        }
        return rootjoin
    })
    return join
}

/*function getwhere(u) {//where和on都支持
    let clazz=u.constructor.name
    let  where=Object.entries(u).filter(([key, value]) => value&&!Array.isArray(value)).map(([k,v])=>{
        if (typeof v!='object'){
            return `${clazz}.${k}='${v}'`
        }else {
            return getwhere(v)
        }
    })
    return where
}*/
async function get1(u: Base, conn, parseMap) {
    console.log(u)
    let clazz = u.constructor.name.toLowerCase()
    parseMap[clazz] = true
    let where = Object.entries(u).filter(([key, value]) => value && typeof value != 'object' && key != 'filter').map(([k, v]) => {
        if (typeof v == 'string') {
            return `${clazz}.${k}='${v}'`
        } else if (typeof v == 'number') {
            return `${clazz}.${k}=${v}`
        }
    }).join(' and ')
    let groups = [`${clazz}.id`]
    let sel = Object.entries(u).map(([k, v]) => {
        if (Array.isArray(v)) {
            console.log(k)
            return `jsonb_agg(${getobjSql(new classMap[k], parseMap)}) as ${k}`
        } else if (typeof v == 'object') {
            groups.push(`${v.constructor.name.toLowerCase()}.id`)
            return `${getobjSql(v, parseMap)} as ${k}`
        } else {
            return `${clazz}.${k}`
        }
    })
    /*    let join=Object.entries(u).filter(([k, v]) => typeof v=='object')
            .map(([k,v])=>`join ${k} on ${k}.${clazz} = ${clazz}.id`).join(' ')*/
    //father
    let join = Object.entries(u).filter(([k, v]) => typeof v == 'object' || Array.isArray(v))
        .map(([k, v]) => u.col(k).link == 'n1' ? `join ${k} on ${clazz}.${k} = ${k}.id` :
            `join ${k} on ${k}.${clazz} = ${clazz}.id`).join(' ')
    where = where || u.where
    where = where ? `where ${where}` : ''

    let sql = `select ${sel}
                   from ${clazz} ${join} ${where}
                   group by ${groups}`
    console.log(sql)
    let rs = await conn.query(sql)
    return rs.rows
}

function getobjSql(u, parseMap) {
    let clazz = u.constructor.name.toLowerCase()
    parseMap[clazz] = true
    let where = Object.entries(u).filter(([key, value]) => value && typeof value != 'object' && key != 'filter').map(([k, v]) => {
        if (typeof v == 'string') {
            return `${k}='${v}'`
        } else if (typeof v == 'number') {
            return `${k}=${v}`
        }
    }).join(' and ')   //循环依赖解决，order.user里面的order被解析过，过滤掉
    let sel = Object.entries(u).filter(([k, v]) => !Array.isArray(v) && !parseMap[k]).map(([k, v]) => {
        if (Array.isArray(k)) {
            return `'${k}'`
        } else if (typeof v == 'object') {
            return `'${k}',(select ${getobjSql(v, parseMap)} as ${k} from ${k} where ${k}.${clazz}=${clazz}.id)`
        } else {
            return `'${k}',${clazz}.${k}`
        }
    })
    //son模式
    let join = Object.entries(u).filter(([k, v]) => typeof v == 'object' || Array.isArray(v))
        .map(([k, v]) => u.col(k).link == 'n1' ? `join ${k} on ${clazz}.${k} = ${k}.id` :
            `join ${k} on ${k}.${clazz} = ${clazz}.id`).join(' ')
    //father模式
    /*    let join=Object.entries(u).filter(([k, v]) => typeof v=='object')
            .map(([k,v])=>`join ${k} on ${clazz}.${k} = ${k}.id`)*/
    where = where || u.where
    where = where ? `where ${where}` : ''

    //let sql=`jsonb_agg(z(${sel}) ${clazz} ${join} ${where})`
    let sql = `jsonb_build_object(${sel})`

    return sql
}

async function add(pname, pid, u, conn) {
    //1.执行自己，2.向下递归对象或者对象数组
    let clazz = u.constructor.name.toLowerCase()
    let sub = []
    if (pid) u[pname] = pid
    let values = Object.entries(u).filter(([k, v]) => {
        if (typeof v == 'object') {
            if (u.col(k).sel){
                return true
            }
            sub.push(v)
        }
        return !base[k]&&typeof v != 'object' && k != 'id'
    }).map(([k, v]) => {
        if (Array.isArray(v)){
            return `'{${v}}'`
        }
        return `'${v}'` || 'null'
    })
    let keys = Object.entries(u).filter(([k, v]) => {
        if (typeof v == 'object') {
            if (u.col(k).sel){
                return true
            }
            sub[k] = v
        }
        return !base[k]&&typeof v != 'object' && k != 'id'
    }).map(([k, v]) => {
        return k || 'null'
    })
    //执行sql获取id
    console.log(`insert into "${clazz}" (${keys})
                     values (${values})`)
    let sql=`insert into "${clazz}" (${keys})values (${values}) RETURNING id`
    console.log(sql)
    let result = await conn.query(sql)
    let parentId = result.rows[0].id
    console.log('parentId', parentId)
    await Promise.all(sub.map(v =>
        Array.isArray(v)
            ? Promise.all(v.map(item => add(clazz, parentId, item, conn)))
            : add(clazz, parentId, v, conn)
    ));
}

async function update(pname, pid, u,conn) {
    let clazz = u.constructor.name
    let sub = []
    if (pid) u[pname] = pid

    let values = Object.entries(u).filter(([k, v]) => {
        if (typeof v == 'object') {
            sub.push(v)
        }
        return v && typeof v != 'object'
    }).map(([k, v]) => {
        return `${k}='${v}'`
    })
/*    let where = Object.entries(u).filter(([key, value]) => value && !Array.isArray(value)).map(([k, v]) => {
        if (typeof v != 'object') {
            return `${clazz}.${k}='${v}'`
        } else {
            return getwhere(v)
        }
    }).flat().join(' and ')*/
    let where = u.where
    where = where ?'where '+where:`where id=${u.id}`
    //执行sql获取id
    let sql=`update ${clazz} set ${values} ${where}`
    console.log(sql)
    let result = await conn.query(sql)
    let parentId = Math.random()
    sub.forEach(v => Array.isArray(v) ? v.forEach(v => update(clazz, parentId, v)) : update(clazz, parentId, v))
}

function getwhere(u) {//where和on都支持
    let clazz = u.constructor.name
    let where = Object.entries(u).filter(([key, value]) => value && !Array.isArray(value)).map(([k, v]) => {
        if (typeof v != 'object') {
            return `${clazz}.${k}='${v}'`
        } else if (u.select.includes(k)){
            return getwhere(v)
        }
    }).filter(item => item !== undefined)
    return where
}

async function del(u,conn,where) {
    let clazz = u.constructor.name
     where=where|| Object.entries(u).filter(([key, value]) =>!base[key]&&value && typeof value!='object').map(([k, v]) => {
        console.log('kkkkk',k)
        if (typeof v != 'object') {
            return `${clazz}.${k}='${v}'`
        } else if (u.select.includes(k)){
            return getwhere(v)
        }
    }).filter(item => item !== undefined).flat().join(' and ')
    where = where || u.where
    where = where ? `where ${where}` : ''

    let sql = `delete from ${clazz} ${where}`
    console.log('del',sql)
    let result = await conn.query(sql)
    return result
}
export async function migrateSql(sql:string) {
    console.log(sql)
    const conn = await pool.connect(); // 从连接池获取一个客户端连接
    try {
        await conn.query(sql)
    } catch (err) {
        throw err
    } finally {
        conn.release(); // 释放客户端连接，返回连接池
    }
}
function isEmptyObject(obj) {
    if (!obj){return true}
    return Object.keys(obj).length === 0;
}
