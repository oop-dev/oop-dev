import {Base,Col,Menu} from "../node_modules/oop-core/Base";
import {Manager} from "./Manager";
@Menu("商家")
export class Merchant extends Base<Merchant> {
    @Col({tag:'名称',type:'',filter:true,show:'1111',link:'n1'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'余额',show:'1111',link:'sstr'})//rstr
    balance=0//支持11,1n,n1,nn,前两个默认子指向父亲，后两个显示申明父持有子
    @Col({tag:'区域经理',sel:[],link:'n1',show:'1111'})//1111代表增删改查是否显示
    manager=new Manager()
    @Col({tag:'订单',link:'1n',show:'0111'})//1111代表增删改查是否显示
    order=[]
    @Col({tag:'应用',link:'1n',show:'1111'})//1111代表增删改查是否显示
    app=[]
    async gets() {
        return await super.gets()
    }
}

