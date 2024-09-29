import {classMap, createInstance, conf, ctx, log} from "./oapi";
// @ts-ignore
import {reactive} from "vue"
let Pool,pool: { connect: () => any; }
export function initdb() {
    Pool= require('pg').Pool;
    // 创建一个连接池
    pool = new Pool({
        connectionString:conf?.pg?.dsn||`postgres://${conf.appid}:${conf.appid}@oop-dev.com:5432/${conf.appid}`,
        max: 10, // 连接池中最大的连接数
        idleTimeoutMillis: 300000, // 30秒内未被使用的连接将被关闭
        connectionTimeoutMillis: 3000, // 2秒内无法建立连接则报错
    });
}
export class Base<T> {
    @Col({tag:'id',type:'',filter:true,show:'0111'})//1111代表增删改查是否显示
    id=0;
    list:T[]
    select: string[]=[]
    where: string | undefined =''
    constructor(opts?:(Partial<Record<keyof T, any>>|number)) {
        if (typeof opts=="number")this.id=opts
        if (typeof window !== 'undefined') {
            let obj=reactive(this)
            wrapMethods(obj)
            // @ts-ignore
            return obj
        }
    }

    // @ts-ignore
   static sel(...keys: ((keyof T)|{})[]) {
       let clazz=this.name.toLowerCase()
        let obj=new classMap[clazz]()
       return obj.sel(...keys)
    }
    sel(...keys: ((keyof T)|{})[]) {
        // 只允许传入当前类的有效属性名
        keys.forEach(x=>{
            if (typeof x=="object"){
                let clazz=x.constructor.name.toLowerCase()
                this[clazz]=x
                this.select.push(clazz)
                return
            }
            if (x=='**'){
                Object.keys(this).filter(k=>!base[k]).forEach(k=>{
                    if (typeof this[k]=='object'){
                        this[k]=new classMap[k]()
                        this.select.push(k)
                    }else {
                        this.select.push(k)
                    }
                })
                return
            }
            // @ts-ignore
            this.select.push(x)
        })
        this.gets=async function (where?:string|number){
            const conn =await getconn() //有事务取事务,没事务创建连接对象
            try{
                let parseMap = {}
                where=isPureNumber(where)?`id=${where}`:where
                where=isEmptyObject(where)?'':where
                return await gets(this, conn, parseMap,where)
            }catch (e) {
                throw e
            }finally {
                release(conn); // 释放客户端连接，返回连接池
            }
        }
        Object.defineProperty(this, 'gets', {enumerable: false});
        return this
    }
    wh(where:string|number|undefined):this {
        // 只允许传入当前类的有效属性名
        where=isPureNumber(where)?`id=${where}`:where
        // @ts-ignore
        this.where=isEmptyObject(where)?'':where
        return this
    }
    page(page:bigint,size:bigint):this{
        // 只允许传入当前类的有效属性名
        // @ts-ignore
        this.where=this.where+` offset ${(page-1)*size} limit ${size}`
        return this
    }
    //增删改查方法被代理，
    static async gets(where?:string){
        let o=this
        if (this.constructor.name=='Function'){
            o=new classMap[this.name.toLowerCase()]()
        }
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try{
            let parseMap = {}
            where=isPureNumber(where)?`id=${where}`:where
            where=isEmptyObject(where)?'':where
            return await gets(o, conn, parseMap,where)
        }catch (e) {
            throw e
        }finally {
            release(conn); // 释放客户端连接，返回连接池
        }
    }
    async gets(where?:string|number){
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try{
            let parseMap = {}
            where=isPureNumber(where)?`id=${where}`:where
            where=isEmptyObject(where)?'':where
            return await gets(this, conn, parseMap,where)
        }catch (e) {
            throw e
        }finally {
            release(conn)
        }
    }

    async getpage(page?,size?){
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try{
            let parseMap = {}
            this.where=getwhere(this)
            this.where=this.where+` order by id desc offset ${(page-1)*size} limit ${size}`
            let list=await gets(this, conn, parseMap)
            // @ts-ignore
            return {list:list.sort((a,b)=>b.id-a.id),total:await this.count()}
        }catch (e) {
            throw e
        }finally {
            release(conn); // 释放客户端连接，返回连接池
        }
    }
    static async get(where?:string|number){
        let o=this
        if (this.constructor.name=='Function'){
            o=new classMap[this.name.toLowerCase()]()
        }
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try{
            let parseMap = {}
            where=isPureNumber(where)?`id=${where}`:where
            where=isEmptyObject(where)?'':where
            return await get(o, conn, parseMap,where)
        }catch (e) {
            throw e
        }finally {
            release(conn); // 释放客户端连接，返回连接池
        }
    }
    async get(where?:string|number){
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try{
            let parseMap = {}
            where=isPureNumber(where)?`id=${where}`:where
            where=isEmptyObject(where)?'':where
            return await get(this, conn, parseMap,where)
        }catch (e) {
            throw e
        }finally {
            release(conn); // 释放客户端连接，返回连接池
        }
    }

    static async add(data?){
        let o=this
        if (this.constructor.name=='Function'){
            o=createInstance(this.name.toLowerCase(),data)
        }
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            await conn.query('BEGIN'); // 开始事务
            await add(null, null, o, conn)
            await conn.query('COMMIT'); // 提交事务
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
    async add(){
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            await conn.query('BEGIN'); // 开始事务
            await add(null, null, this, conn)
            await conn.query('COMMIT'); // 提交事务
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
    static async update(where?:string|number,data?){
        let o=this
        if (this.constructor.name=='Function'){
            o=createInstance(this.name.toLowerCase(),data)
        }
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            where=isPureNumber(where)?`id=${where}`:where
            where=isEmptyObject(where)?'':where
            await conn.query('BEGIN'); // 开始事务
            await update(null, null, o, conn,where)
            await conn.query('COMMIT'); // 提交事务
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
    async update(where?:string|number){
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            where=isPureNumber(where)?`id=${where}`:where
            where=isEmptyObject(where)?'':where
            await conn.query('BEGIN'); // 开始事务
            await update(null, null, this, conn,where)
            await conn.query('COMMIT'); // 提交事务
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
    static async del(where?:string|number){
        let o=this
        if (this.constructor.name=='Function'){
            o=new classMap[this.name.toLowerCase()]()
        }
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            where=isPureNumber(where)?`id=${where}`:where
            where=isEmptyObject(where)?'':where
            await conn.query('BEGIN'); // 开始事务
            await del( o, conn,where)
            await conn.query('COMMIT'); // 提交事务
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
    async del(where?:string|number){
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            where=isPureNumber(where)?`id=${where}`:where
            where=isEmptyObject(where)?'':where
            await conn.query('BEGIN'); // 开始事务
            await del( this, conn,where)
            await conn.query('COMMIT'); // 提交事务
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
    static async count(where?:string){
        let clazz=this.name
        if (this.constructor.name=='Function'){
            clazz=this.name
        }
        clazz=clazz.toLowerCase()
        where=where?`where ${where}`:''
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            let rsp=await conn.query(`select count(*) from "${clazz}" ${where}`); // 提交事务
            return parseInt(rsp.rows[0].count)
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
     async count(where?:string){
        let clazz=this.constructor.name.toLowerCase()
        where=where?`where ${where}`:''
         const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            let rsp=await conn.query(`select count(*) from "${clazz}" ${where}`); // 提交事务
            return parseInt(rsp.rows[0].count)
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
    static async query(sql:string){
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            let rsp=await conn.query(sql); // 提交事务
            return rsp
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
    async query(sql:string){
        const conn =await getconn() //有事务取事务,没事务创建连接对象
        try {
            let rsp=await conn.query(sql); // 提交事务
            return rsp
        } catch (err) {
            if (!ctx.getStore().tx){//无事务立马回滚，有事务@Tx处理回滚
                await conn.query('ROLLBACK'); // 事务回滚
            }
            throw err
        } finally {
            release(conn); // 释放客户端连接，返回连接池
        }
        return null
    }
    tx(){

    }
    err(msg) {
        return (e)=> {
            log(`${msg},${e.stack}`)
            throw msg; // 返回动态的错误处理信息
        };
    }
    cols():[]{
        // @ts-ignore
        return this.constructor.metadata
    }
    col(k){
        // @ts-ignore
        return this.constructor.metadata[k]
    }
}
export function err(msg) {
    return (e)=> {
        log(`${msg},${e.stack}`)
        throw msg; // 返回动态的错误处理信息
    };
}
export function Constructor(target) {
    return new Proxy(target, {
        construct(target, args) {
            if (typeof args[0]=="number"){
                let obj=new target()
                obj.id=args[0]
                return obj
            }
            return Object.assign(new target(),args[0]);
        }
    });
}
export function Tx(target, name, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value =async function(...args) {
        const conn =await pool.connect() //有事务取事务,没事务创建连接对象
        ctx.getStore().tx=conn
        try {
            await conn.query('BEGIN'); // 开始事务
            const result =await originalMethod.apply(this, args);
            await conn.query('COMMIT'); // 提交事务
            return result;
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            throw err
        } finally {
            conn.release() // 释放客户端连接，返回连接池
        }
    }
    return descriptor;
}
export function Col(options) {
    return function (target, propertyKey) {
        // 确保每个类都有独立的 metadata
        if (!target.constructor.hasOwnProperty('metadata')) {
            Object.defineProperty(target.constructor, 'metadata', {
                value: {}, // 创建一个新的 metadata 对象
                writable: true,
                enumerable: false, // 不让 metadata 枚举，保持类结构干净
                configurable: true
            });
        }

        // 获取或设置 metadata 对象
        const metadata = target.constructor.metadata;

        // 继承父类的 metadata
        if (Object.getPrototypeOf(target.constructor).metadata) {
            Object.assign(metadata, Object.getPrototypeOf(target.constructor).metadata);
        }

        // 添加当前属性的 metadata
        if (!metadata[propertyKey]) {
            options['col'] = propertyKey;
            metadata[propertyKey] = options;
        }

        // 确保 target[propertyKey] 存在并可枚举
        if (!(propertyKey in target)) {
            target[propertyKey] = null;
        }

        // 设置属性的描述符
        Object.defineProperty(target, propertyKey, {
            enumerable: true, // 使属性可枚举
            writable: true,   // 使属性可写
            configurable: true, // 使属性可配置
            value: target[propertyKey] // 设置属性的初始值
        });
    };
}
export function Menu(name:string) {
    return function (target) {
        // 直接将 menu 属性添加到类构造函数上
        Object.defineProperty(target, 'menu', {
            value: name,
            writable: true,
            enumerable: false,
            configurable: true
        });
    };
}



function nest(data, clazz) {
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
    delete obj.where
    delete obj.select
    delete obj.where
    delete obj.list
    Object.entries(obj).filter(([k,v])=>!base[k]).forEach(([k, v]) => {
        if (v&&Array.isArray(v)&&!parseMap[k]) {//解决重复赋值和循环依赖
            let obj = create(k, row, m,parseMap)
            if (row[k+'_id']&&!v.some(role => role?.id == row[`${k}_id`])) {//数组不需要处理循环依赖
                v.push(obj);
            }else {
                obj[k]=null
            }
        } else if (v&&typeof v == 'object') {//解决重复赋值和循环依赖
            // @ts-ignore
            if (row[k+'_id']&&!v?.id&&!parseMap[k]){
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
    let clazz = u.constructor.name.toLowerCase()
    parseMap[clazz] = true
    where=where|| Object.entries(u).filter(([key, value]) =>!base[key]&&value && typeof value!='object').map(([k, v]) => {
        if (typeof v != 'object') {
            return `"${clazz}".${k}='${v}'`
        } else if (u.select.includes(k)){
            return getwhere(v)
        }
    }).filter(item => item !== undefined).flat().join(' and ')
    where=where&&!startsWithOrderByOrLimit(u.where)?`where ${where}`:where
    if (!u.select||u?.select?.length==0){u.select=['*']}
    let sel = Object.entries(u).filter(([k, v]) =>u.select&&!base[k]&& !parseMap[k]).map(([k, v]) => {
        if (typeof v != 'object'&&(u.select.includes(k)|u.select.includes('*'))) {
            return `"${clazz}".${k} as ${clazz}_${k}`
        } else if (u.select.includes(k)) {
            let s=getsel(v, parseMap)
            return s
        }
    }).filter(item => item !== undefined)
    let join = Object.entries(u).filter(([key, value]) =>u.select&&u.select.includes(key)&&value&& key!='list'&&typeof value == 'object'&&!parseMap[key]).map(([k, v]) => {
        let son = k
        let rootjoin=''
        // @ts-ignore
        let on=v.where? `on ${v.where}` : ''
        if (u.col(k)?.link == 'n1'){
            rootjoin=`left join ${k} on "${clazz}".${k} = ${k}.id ${on}`
        }else if (u.col(k)?.link == 'nn'){
            rootjoin=`left join lateral unnest("${clazz}".${k}) AS ${k}_id ON true JOIN ${k}  ON ${k}.id = ${k}_id ${on}`
        }else {
            rootjoin=`left join ${son}  ON ${son}.${clazz} = ${clazz}.id ${on}`
        }
        return [rootjoin, ...getjoin(v,parseMap)]
    }).flat().join('\n')

    let main=''
    if (join){//修改，两个where要同时判断，不是二选一
        let where_main=u.where&&!u.where.trim().startsWith('offset')?`where ${u.where}`:where+u.where
        main=`(select * from "${clazz}" ${where_main}) as "${clazz}"`
    }else if (u.where) {
        where=u.where&&!startsWithOrderByOrLimit(u.where)?`where ${u.where}`:u.where
    }
    main=main||`"${clazz}"`
    let sql = `select ${sel} from ${main} ${join} ${where}`
    console.log('sql',sql)
    let rs = await conn.query(sql)
    return nest(rs.rows, clazz)
}
function startsWithOrderByOrLimit(str) {
    const regex = /^(order by|offset)/i;
    return regex.test(str.trim());
}
function getsel(u, parseMap) {
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
        // @ts-ignore
        let on=v.where? `on ${v.where}` : ''
        if (u.col(k)?.link == 'n1'){
            rootjoin=`left join ${k} on ${clazz}.${k} = ${k}.id ${on}`
        }else if (u.col(k)?.link == 'nn'){
            rootjoin=`left join lateral unnest(${clazz}.${k}) AS ${k}_id ON true JOIN ${k}  ON ${k}.id = ${k}_id ${on}`
        }else {
            rootjoin=`left join ${son}  ON ${son}.${clazz} = ${clazz}.id ${on}`
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
// @ts-ignore
async function get1(u: Base, conn, parseMap) {
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
    if (u.id){
        update(pname, pid, u,conn)
        return
    }
    if (u.delete){
        del(u,conn)
        return
    }
    //1.执行自己，2.向下递归对象或者对象数组
    let clazz = u.constructor.name.toLowerCase()
    let sub = []
    if (pid) u[pname] = pid
    let values = Object.entries(u).filter(([k, v]) => {
        if (base[k]){
            return false
        }
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
        if (base[k]){
            return false
        }
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
    let sql=`insert into "${clazz}" (${keys})values (${values}) RETURNING id`
    console.log(sql)
    let result = await conn.query(sql)
    let parentId = result.rows[0].id
    await Promise.all(sub.map(v =>
        Array.isArray(v)
            ? Promise.all(v.map(item => add(clazz, parentId, item, conn)))
            : add(clazz, parentId, v, conn)
    ));
}

async function update(pname, pid, u,conn,where?) {
    if (typeof u!='object')return
    if (!u.id){
        add(pname, pid, u,conn)
        return
    }
    if (u.delete){
        del(u,conn)
        return
    }
    let clazz = u.constructor.name.toLowerCase()
    let sub = []
    if (pid) u[pname] = pid

    let values = Object.entries(u).filter(([k, v]) => {
        if (base[k]){
            return false
        }
        if (typeof v == 'object') {
            sub.push(v)
        }
        return v && typeof v != 'object'
    }).map(([k, v]) => {
        return `"${k}"='${v}'`
    })
    /*    let where = Object.entries(u).filter(([key, value]) => value && !Array.isArray(value)).map(([k, v]) => {
            if (typeof v != 'object') {
                return `${clazz}.${k}='${v}'`
            } else {
                return getwhere(v)
            }
        }).flat().join(' and ')*/
    where = u.where||where
    where = where ?'where '+where:`where id=${u.id}`
    //执行sql获取id
    let sql=`update "${clazz}" set ${values} ${where}`
    let result = await conn.query(sql)
    let parentId = Math.random()
    // @ts-ignore
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

async function del(u,conn,where?) {
    let clazz = u.constructor.name.toLowerCase()
    where=where|| Object.entries(u).filter(([key, value]) =>!base[key]&&value && typeof value!='object').map(([k, v]) => {
        if (typeof v != 'object') {
            return `"${clazz}".${k}='${v}'`
        } else if (u.select.includes(k)){
            return getwhere(v)
        }
    }).filter(item => item !== undefined).flat().join(' and ')
    where = where || u.where
    where = where ? `where ${where}` : ''

    let sql = `delete from "${clazz}" ${where}`
    let result = await conn.query(sql)
    return result
}
export async function migrateSql(sql:string) {
    const conn = await pool.connect(); // 从连接池获取一个客户端连接
    try {
        return await conn.query(sql)
    } catch (err) {
        throw err
    } finally {
        conn.release() // 释放客户端连接，返回连接池
    }
}
function isEmptyObject(obj) {
    if (!obj){return true}
    return Object.keys(obj).length === 0;
}
function wrapMethods(obj) {
        // 浏览器环境，增强方法并替换为新的逻辑
    let list=Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
    let base_list=Object.getOwnPropertyNames(Object.getPrototypeOf(obj.constructor.prototype))
    const mergedSet = new Set([...list, ...base_list]);
    // @ts-ignore
    for (let key of mergedSet) {
            if (typeof obj[key] === 'function' &&!['constructor','cols','cols'].includes(key )) {
                // 替换方法
                let className = obj.constructor.name.toLowerCase().replaceAll('_','')
                obj[key] =async function (...args) {
                    // 你可以在这里添加新的逻辑，而不是调用原来的方法
                    let {list,total,...data}=obj
                    // @ts-ignore
                    let rsp= await post(className + '/' + key, [data,...args])
                    if (Array.isArray(rsp)){
                        if (rsp){
                            obj.list=rsp
                        }
                    }else if (rsp&&typeof rsp=='object') {
                        Object.keys(obj).forEach(k=>{
                            if (rsp[k]){
                                obj[k]=rsp[k]
                            }
                        })
                    }
                    if (rsp?.list){
                        obj.list=rsp?.list
                    }
                    if (rsp?.total){
                        obj.total=rsp?.total
                    }
                    if (['add','update'].includes(key)){
                        // @ts-ignore
                        import('@/router/index').then((m=>m.to('gets')))
                    }else if (key=='del'){
                        // @ts-ignore
                        let rsp= await post(className + '/gets', data)
                        obj.list=Array.isArray(rsp)?rsp:rsp?.list
                    }
                    return rsp
                }
            }
        }
}
export const post = async (url, data, header) => {
    try {
        // 创建完整的请求 URL
        // @ts-ignore
        const requestUrl =import.meta.env.VITE_BASE_URL+'/' + url;
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
            const errorData = await response.text();
            if (errorData=== 'Unauthorized') {
                // 在 401 错误时重定向到登录页
                window.location.href = '/login';
            }
            throw errorData;
        }
        const responseData = await response.json();
        return responseData;

    } catch (error) {
        throw error;
    }
}

function isPureNumber(str) {
    if (typeof str=='number'){
        return true
    }
    return /^\d+$/.test(str);
}
export function set(obj, data) {
    if (!data)return
    Object.entries(data).forEach(([k, v]) => {
        if (data?.[k] && Array.isArray(v)) {//可能是对象数组，可能是普通数组
            obj[k] = data?.[k].map(v => typeof v == 'object' ? createInstance(k, v) : v)
        } else if (data?.[k] && typeof v == 'object') {
            //是id直接赋值
            obj[k] =typeof data[k]=='object'?createInstance(k, data[k]):data[k]
        } else if (data?.[k]) {
            obj.name=data
        }
    })
    return obj;
}
async function getconn() {
    return ctx.getStore().tx||await pool.connect()
}
async function release(conn) {
    if (!ctx.getStore().tx){//无事务立马释放，有事务@Tx处理释放
        conn.release()
    }
}
