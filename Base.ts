export class Base<T> {
    @Col({tag:'id',type:'',filter:true,show:'0111'})//1111代表增删改查是否显示
    id=0;
    list:T[]
    select: (keyof T)|string[]=[]
    on=''
    where:''
    /*    create_at=0;
        update_at=0;
        page:0
        size:0
        where:string*/
    //
    constructor() {
    }
    sel(...keys: ((keyof T)|'*')[]) {
        // 只允许传入当前类的有效属性名
        this.select = keys;
        return this
    }

    //增删改查方法被代理，其他不变
    async gets(where?:string){

    }
    async get(where?:string):Promise<T>{
      return null
    }
    async add(){

    }
    async update(where?:string){

    }
    async del(where?:string){

    }
    async exec(sql:string

    ){

    }
    tx(){

    }
    err(msg) {
        return (e)=> {
            console.error( JSON.stringify(this),msg,e.stack); // 打印错误日志
            throw msg; // 返回动态的错误处理信息
        };
    }
    cols():[]{
        return this.constructor.metadata
    }
    col(k){
        return this.constructor.metadata[k]
    }
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
export function Menu(...name:string[]) {
    return function (target,fn) {
        // 直接将 menu 属性添加到类构造函数上
        Object.defineProperty(target, 'menu', {
            value: name,
            writable: true,
            enumerable: false,
            configurable: true
        });
    };
}

export function log() {
    return function () {
        console.log('log')
    };
}
