import {Base, log, Col, Menu} from "../Base";
import  {Permission} from "./Permission";


@Menu('角色')
export class Role extends Base<Role> {
    @Col({tag:'名称',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'权限',sel:[],link:'nn',show:'1111'})//1111代表增删改查是否显示
    permission:Permission[]|Permission=[]
    // @ts-ignore
    async gets() {
        this.sel("id","name","permission")
        return await super.gets()
    }
}

