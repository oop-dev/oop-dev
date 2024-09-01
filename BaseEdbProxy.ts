import * as edgedb from "edgedb";

// 创建 EdgeDB 客户端实例
const e = edgedb.createClient();
export function New<T>(clazz: new (...args: any[]) => T): T {
    // @ts-ignore
    return new Proxy(new clazz(), {
        get(target, property, receiver) {
            let className=target.constructor.name
            // 您可以在这里自定义代理行为
            if (property === 'get') {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    let eql=await getEql(target)
                    return `select ${target.constructor.name}`+eql
                    // 不执行原始方法
                };
            }
            if (property === 'add') {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    // @ts-ignore

                    return await addEql(target)
                    // 不执行原始方法
                };
            }
            if (property === 'update') {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    return await updateEql(target)
                };
            }
            if (property === 'del') {
                // 返回一个新的函数，这个函数不调用原始方法
                return async function (...args) {
                    return await delEql(target)
                };
            }
            return Reflect.get(target, property, receiver);
        }
    })
}
// 通过代理对象访问属性和方法时，将获得类型提示
 function getEql(u) {
    let  filter=Object.entries(u).filter(([key, value]) => value&&typeof value != 'object'&& key != 'filter').map(([k,v])=>{
        if (k=='id'){
            return `.${k}=<uuid>'${v}'`
        }else if (typeof v=='string'){
            return `.${k}='${v}'`
        }else if (typeof v=='number') {
return `.${k}=${v}`
        }
    }).join(' and ')
    let  sel=Object.entries(u).filter(([key, value]) => !Array.isArray(value)).map(([k,v])=>{
        if (typeof v!='object'){
            return k
        }else {
            return `${k}:${getEql(v)}`
        }
    })
    filter=filter||u.filter
    filter=filter?`filter ${filter}`:''

    let eql=`{${sel}} ${filter}`
    return eql
}


function addEql(u) {//子元素不一定是添加，还可以是修改，如充值，交易记录添加，里面的用户余额是修改，
    let  sel=Object.entries(u).filter(([key, value]) =>value&& key != 'filter').map(([k,v])=>{
        if (Array.isArray(v)){
            let list=v.map(x=>{
                if (x.delete){
                    return `(${delEql(x)})`
                }else if (x.id) {
                    return `(${updateEql(x)})`
                }
                return `(${addEql(x)})`
            }) //判断调用增删改查哪个方法，getEql，addEql，UpdateEql
            return `${k}:={${list}}`
        }else if(typeof v=='object') {//判断调用增删改查哪个方法，getEql，addEql，UpdateEql
            // @ts-ignore
            if (v.delete){
                return `${k}:=(${delEql(v)})`
            }else if (v.id) {
                return `${k}:=(${updateEql(v)})`
            }
            return `${k}:=(${addEql(v)})`
        }else {
            return `${k}:='${v}'`
        }
    })

    const className = u.constructor.name;
    return `insert ${className} {${sel}}`  //
}
function updateEql(u) {
    //没条件，默认根据id修改
    let filter=u.filter||`.id=<uuid>'${u.id}'`
    filter=filter?`filter ${filter}`:''
    let updateQlList=[]
    let  sel=Object.entries(u).filter(([key, value]) => key != 'filter'&&value).map(([k,v])=>{
        if (Array.isArray(v)){
            let list=v.map(x=>{
                if (x.delete){
                    return `(${delEql(x)})`
                }else if (hasOnlyId(x)) {
                    return  `(select ${x.constructor.name}${getEql(x)})`
                }else if (x.id) {
                    return `(${updateEql(x)})`
                }
                return `(${addEql(x)})`
            }) //判断调用增删改查哪个方法，getEql，addEql，UpdateEql
            return `${k}:={${list}}`
        }else if(typeof v=='object') {//判断调用增删改查哪个方法，getEql，addEql，UpdateEql
            // @ts-ignore
            if (v.delete){//删除
                return `${k}:=(${delEql(v)})`
            }else if (hasOnlyId(v)) {//查询
                return `${k}:=(select ${v.constructor.name}${getEql(v)})`
            }else if (v.id) {//修改
                return `${k}:=(${updateEql(v)})`
            }
            return `${k}:=(${addEql(v)})`//添加
        }else {
            if (typeof v=="string"){
                if (v.toString().startsWith('+')||v.toString().startsWith('+')){
                    return `${k}:=.${k}${v}`
                }else {
                    return `${k}:='${v}'`
                }
            }
        }
    })
    const className = u.constructor.name;
    return `update ${className} ${filter} set{${sel}}` //追加updateQlList
}
function delEql(u) {
    let  filter=Object.entries(u).filter(([key, value]) =>key != 'delete'&& value != ''&&value != undefined&&typeof value != 'object'&& key != 'filter').map(([k,v])=>{
        if (k=='id'){
            return `.${k}=<uuid>'${v}'`
        }else if (typeof v=='string'){
            return `.${k}='${v}'`
        }else if (typeof v=='number') {
            return `.${k}=${v}`
        }
    }).join(' and ')
    filter=filter||u.filter
    filter=filter?`filter ${filter}`:''

    const className = u.constructor.name;
    return `delete ${className} ${filter}`
}
function hasOnlyId(obj) {
    return Object.keys(obj).every(key =>
        (key === 'id' && obj[key] !== null && obj[key] !== undefined) ||
        (key !== 'id' && (obj[key] === null || obj[key] === undefined))
    );
}
