import {Role} from "./Role";
import {Base,Col} from "../node_modules/oop-core/Base";
import {conf} from "../node_modules/oop-core/conf.js";
import {sha256,jwtToken} from "../node_modules/oop-core/utils";

export class User extends Base<User> {
    @Col({tag:'名称',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'密码',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    pwd=''
    @Col({tag:'角色',sel:[],link:'nn',show:'1111'})//1111代表增删改查是否显示
    role: Role[]|Role=[];
    // @ts-ignore
    async gets() {
        //模拟数据库查询，super.get()，super.get是base dao的数据库增删改查接口，根据this参数自动查询
        //this.role=new Role().sel("permission")
        //console.log(conf.appid)
        console.log('count-----------',await super.query('select count(*)'))
        //this.sel("id","name")
        return await super.gets()
    }
    async add() {
        //模拟数据库查询，super.get()，super.get是base dao的数据库增删改查接口，根据this参数自动查询
        //this.role=new Role().sel("permission")
        //console.log(conf.appid)
        console.log('this-----------',this)
        //this.sel("id","name")
        this.pwd=await sha256(this.pwd)
        return await super.add()
    }
    async login({code,token}) {
        if (await sha256(code)!=token)throw '验证码错误'
        //5表联查，等于user,user_role,role,role_permision,permission的sql 5表联查
        this.pwd=await sha256(this.pwd)
        this.sel("id","name","pwd","role").role=new Role().sel("id","name","permission")
        let user=await super.get()
        if (!user)throw '用户名密码错误'
        return {user:user,token:await jwtToken(user)}
    }
    async captcha() {
        let data=generateRandomText(4)
        return {code:data,token:await sha256(data)}
    }
}

/*export async function sha256(message:string) {
    // 创建一个 SHA-256 哈希对象
    const hash = crypto.createHash('sha256');

    // 更新哈希对象
    hash.update(message+'jg,re`h5y34~`thst');

    // 计算哈希并以十六进制字符串的形式返回结果
    return hash.digest('hex');
}*/
function generateRandomText(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        text += charset[randomIndex];
    }
    return text;
}
