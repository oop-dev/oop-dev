import {Base,Col,Menu} from "../node_modules/oop-core/Base";
// @ts-ignore

@Menu('权限')
export class Permission extends Base<Permission> {
    @Col({tag:'名称',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    // @ts-ignore
}

