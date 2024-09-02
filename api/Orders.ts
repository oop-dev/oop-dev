import {Base,Col,Menu} from "../node_modules/oop-core/Base";
@Menu('订单')
export class Orders extends Base<Orders> {
    @Col({tag:'名称',type:'',filter:true,show:'1111',link:'n1'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'价格',sel:['上海','北京'],show:'1111',link:'sstr'})//rstr
    total=0//支持11,1n,n1,nn,前两个默认子指向父亲，后两个显示申明父持有子
    /*@Col({type:'sel,上海,北京,深圳,杭州',tag:'用户',link:'n1',cascade:true})
    users:Users=new Users()*/
    async get1() {
        //模拟数据库查询，super.get()，super.get是base dao的数据库增删改查接口，根据this参数自动查询
        console.log('get order',this)

        return this.sel("id").get()
    }
}

