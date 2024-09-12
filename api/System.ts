import {Base} from "oop-core/Base";
import {classMap} from "oop-core/oapi";
export class System extends Base<System> {

    async get() {
        //模拟数据库查询，super.get()，super.get是base dao的数据库增删改查接口，根据this参数自动查询
        let clazz={}
        let menu={}
        Object.keys(classMap).forEach(k=>{
            console.log(k)
            let o=new classMap[k]()
            if (!o.col){return}
            clazz[k]=o.cols()
            menu[k]=o.constructor.menu
        })
        return {classMap:clazz,menu:menu}
    }
}
