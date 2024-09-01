import {Base, log, Col, Menu} from "../Base";
//import svgCaptcha from "svg-captcha";
import {Role} from "./Role";
import {Orders} from "./Orders";
import  {App} from "./App";
import  {Permission} from "./Permission";
//import base64 from "base-64";
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
        this.sel("id","name","pwd","role")
        return await super.gets()
    }
    async login({code,token}) {
        console.log('code,token',code,token)
        if (await sha256(code)!=token)throw '验证码错误'
        //5表联查，等于user,user_role,role,role_permision,permission的sql 5表联查
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

async function sha256(message) {
    // 将字符串编码为 Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // 计算 SHA-256 哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // 将 ArrayBuffer 转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}


export async function getJwt(token) {
    return JSON.parse(atob(token))
}
export async function jwtToken(obj) {
    const sign = await sha256(JSON.stringify(obj))
    let jwt={payload:obj,sign:sign}
    console.log(base64(JSON.stringify(jwt)))
    return base64(JSON.stringify(jwt))
}
export async function verifyToken(token){
    if (!token)return false
    let jwt=JSON.parse(btoa(token))
    return token==await jwtToken(jwt.payload)
}
function base64(input) {
    // 将输入字符串转换为 Buffer 对象，并编码为 Base64
    return Buffer.from(input).toString('base64');
}
