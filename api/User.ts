import {Role} from "./Role";
import {Base,Col} from "../oop-core/Base";
import {conf,jwtToken,sha256} from "../oop-core/oapi.js";
export class User extends Base<User> {
    @Col({tag:'名称',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'密码',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    pwd=''
    @Col({tag:'角色',sel:[],link:'nn',show:'1111'})//1111代表增删改查是否显示
    role: Role[]|Role=[];
    // @ts-ignore
    async add() {
        this.pwd=await sha256(this.pwd)
        return await super.add()
    }
    async login({code,token}) {
        if (await sha256(code)!=token)throw '验证码错误'
        //5表联查，等于user,user_role,role,role_permision,permission的sql 5表联查
        this.pwd=await sha256(this.pwd)
        let user=await super.sel("id", "name", Role.sel('**')).get()
        if (!user)throw '用户名密码错误'
        return {user:user,token:await jwtToken(user)}
    }
    async captcha() {
        let data=generateRandomText(4)
        return {code:data,token:await sha256(data)}
    }
}


function generateRandomText(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        text += charset[randomIndex];
    }
    return text;
}
