import {Base,Col,Menu} from "../oop-core/Base";
import  {Permission} from "./Permission";
export class Role extends Base<Role> {
    @Col({tag:'名称',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'权限',sel:[],show:'1111'})//1111代表增删改查是否显示
    permission:Permission[]|Permission=[]
}

