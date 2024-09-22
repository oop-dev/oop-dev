import {run, conf, verifyToken,getJwt, Rsp} from "./oop-core/oapi";
run(intercepter)
async function intercepter(r,w) {
    const path = new URL(r.url).pathname.substring(1);
    let token=r.headers.get('Authorization')
    if (conf.auth && !conf.blacklist.includes(path) && !(await verifyToken(token))){
        //去掉错误码，直接用错误信息代替错误码
        throw 'Unauthorized'
    }
    if (conf.auth&&!conf.blacklist.includes(path) &&!has(getJwt(token).payload,path)){
        throw 'Forbidden'
    }
}
function has(user,perm) {
    let permissions=user?.role.flatMap(r=>r.permission)
    let has=permissions?.some(p =>['*',perm].includes(p.name))
    return has
}
