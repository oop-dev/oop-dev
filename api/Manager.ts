import {Base,Col,Menu} from "../node_modules/oop-core/Base";
import {Permission} from "./Permission";
import {Order} from "./Order";
import {Merchant} from "./Merchant";
@Menu("区域经理")
export class Manager extends Base<Manager> {
    @Col({tag:'名称',type:'',filter:true,show:'1111',link:'n1'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'提成费率',show:'1111',link:'sstr'})
    rate=0
}
