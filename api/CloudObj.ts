import {Base,Col,Menu} from "../oop-core/Base";
import {classMap} from "../oop-core/oapi.js";
import {migrate} from "../oop-core/migrate";
import {Manager} from "./Manager";

@Menu("云对象")
export class CloudObj extends Base<CloudObj> {
    @Col({tag:'云对象名称',type:'',filter:true,show:'1111'})//1111代表增删改查是否显示
    name=''
    @Col({tag:'菜单名',type:'',filter:false,show:'1111'})//1111代表增删改查是否显示
    menu=''
    @Col({tag:'云对象属性',link:'1n',show:'1111'})//1111代表增删改查是否显示
    attr=[]
    async gets(r,r1) {
        console.log(r,r1.socket.remoteAddress)
        return Object.keys(classMap).map((x,i)=>{return {id:i+1,name:x,menu:new classMap[x]().constructor.menu}})
    }

    // @ts-ignore
    async getpage() {
        return Object.keys(classMap).map((x,i)=>{return {id:i+1,name:x,menu:new classMap[x]().constructor.menu}})
    }
    async del(id) {
        let clazz=Object.keys(classMap)[id-1]
        console.log(clazz)
        const fs = require('fs').promises;
        await fs.unlink(`./api/${upper(clazz)}.ts`)
        await this.query(`drop table ${clazz}`)
        return 1
    }
    async add() {
        console.log('index',this)
        let sellist=[`''`,0]
        let attrs=this.attr.map(x=>{
            let sel=x.sel?`,sel:[${x.sel.split(' ').map(x=>`'${x}'`)}]`:''
            return `    @Col({tag:'${x.tag}',type:'',filter:${x.filter==0?false:true},show:'1111'${sel}})
    ${x.name}=${sellist[x.type]}`
        }).join('\n')
        await writeToFile(`./api/${upper(this.name)}.ts`, `import {Base,Col,Menu} from "../oop-core/Base";
@Menu('${this.menu}')
export class ${upper(this.name)} extends Base<${upper(this.name)}> {
${attrs}
}
`);     // @ts-ignore
        const module = await import(`./${upper(this.name)}.ts`);
        // @ts-ignore
        classMap[this.name.toLowerCase()] = module[upper(this.name)]
        migrate(classMap)
        console.log('classMap',classMap)
        return  1
    }
}
async function writeToFile(filePath, content) {
    try {
        const fs = require('fs').promises;
        await fs.writeFile(filePath, content, 'utf8');
        console.log('文件写入成功');
    } catch (err) {
        console.error('写入文件时发生错误:', err);
    }
}
function upper(str) {
    if (!str) return str;  // 处理空字符串
    return str.charAt(0).toUpperCase() + str.slice(1);
}
