import {Base, Col, Menu} from "../node_modules/oop-core/Base";

// @ts-ignore

export class Permission extends Base<Permission> {
    @Col({tag: '名称', type: '', filter: true, show: '1111'})//1111代表增删改查是否显示
    name = ''
    // 后端接口
    async gets() {
        // super.gets()查询数据库，base默认实现了gets，get，add，update，del，这几个云方法可以不写
        return await super.gets()

    }
    async del() {
        // super.gets()查询数据库，base默认实现了gets，get，add，update，del，这几个云方法可以不写
        console.log('del',this)
        return await super.del()
    }
}

