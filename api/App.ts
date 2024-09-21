import {Base,Col,Menu} from "../oop-core/Base";

@Menu('应用')
export class App extends Base<App> {
    @Col({tag:'应用名',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'应用id',type:'',show:'1111'})//1111代表增删改查是否显示
    ak=''
    @Col({tag:'私钥',type:'',show:'1111'})//1111代表增删改查是否显示
    sk=''
}

