import {Base, Col, Menu} from "../oop-core/Base";
import {sha256} from "../oop-core/oapi";
import {Role} from "./Role";
export class Permission extends Base<Permission> {
    @Col({tag: '名称', type: '', filter: true, show: '1111'})//1111代表增删改查是否显示
    name = ''
    @Col({tag:'角色',sel:[],show:'1111'})//1111代表增删改查是否显示
    role:Role[]|Role=[]
/*    async gets() {
        let name=`" or true --`
        name=name.replaceAll(`'`,`"`)
        return await super.gets(`name='${name}`)
    }*/
}
//
//结论模板字符串可以防止非单引号形式的sql注入
//模板字符串是否可以防止单引号截断

