import {Base, Col, log, Menu} from "../Base";

@Menu('应用')
export class App extends Base<App> {
    @Col({tag:'应用名',type:'',filter:true,show:'1111',link:'11'})//1111代表增删改查是否显示
    name=''
    // @ts-ignore
    async get() {
        //模拟数据库查询，super.get()，super.get是base dao的数据库增删改查接口，根据this参数自动查询
        return [{id:'fdsag',name:'asfdf'}]
    }
    async add1() {
        //this是前端传来的参数，也是操作添加方法的对象
        console.log(this)
        //模拟数据库，super.add() ，添加成功，super.add是base dao的数据库增删改查接口
        return '添加成功'
    }
}

