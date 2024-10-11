import {Base,Col,Menu} from "../oop-core/Base";
@Menu('演员')
export class Actor extends Base<Actor> {
    @Col({tag:'姓名',type:'',filter:true,show:'1111'})
    name=''
    @Col({tag:'年龄',type:'',filter:false,show:'1111'})
    age=0
    @Col({tag:'性别',type:'',filter:true,show:'1111',sel:['男','女']})
    sex=0
}
