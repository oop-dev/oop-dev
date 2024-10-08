import {Base,Col,Menu} from "../oop-core/Base";
export class Attr extends Base<Attr> {
    @Col({tag:'属性名',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'中文标识',type:'',show:'1111'})//1111代表增删改查是否显示
    tag=''
    @Col({tag:'类型',sel:['字符串','数字'],type:'',show:'1111'})//1111代表增删改查是否显示
    type=0
    @Col({tag:'下拉框',type:'',show:'1111'})//1111代表增删改查是否显示
    // @ts-ignore
    sel=''
    @Col({tag:'是否筛选',sel:['否','是'],type:'',show:'1111'})//1111代表增删改查是否显示
    filter=0
    @Col({tag:'对象关系',sel:['1对1','1对多','多对1','多对多'],type:'',show:'1111'})//1111代表增删改查是否显示
    link=''
}

