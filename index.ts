import {run, conf, verifyToken,getJwt, Rsp} from "oop-core/oapi";
run(intercepter)
async function intercepter(r) {
    const path = new URL(r.url).pathname.substring(1);
    let token=r.headers.get('Authorization')
    console.log('token',token)
    if (conf.auth && !conf.blacklist.includes(path) && !(await verifyToken(token))){
        //返回Response对象或者抛出Error代表终止
        return Rsp(401, 'Unauthorized')
    }
    if (conf.auth&&!conf.blacklist.includes(path) &&!has(getJwt(token).payload,path)){
        return Rsp(403, 'Forbidden')
    }
}
function has(user,perm) {
    console.log(user)
    let permissions=user?.role.flatMap(r=>r.permission)
    console.log('permissions',permissions)
    let has=permissions?.some(p =>['*',perm].includes(p.name))
    console.log('perm',perm,'has',has)
    return has
}
