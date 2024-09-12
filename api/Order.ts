import {Base,Col,Menu} from "../node_modules/oop-core/Base";
import {Merchant} from "./Merchant";
@Menu("订单")
export class Order extends Base<Order> {
    @Col({tag:'名称',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'状态',sel:['未支付','已支付'],filter:true,show:'1111'})//1111代表增删改查是否显示
    status=0
    @Col({tag:'价格',show:'1111'})//rstr
    total=0//支持11,1n,n1,nn,前两个默认子指向父亲，后两个显示申明父持有子
    @Col({tag:'商家',sel:[],link:'n1',show:'1111',cascade:true})
    merchant=new Merchant()
}

