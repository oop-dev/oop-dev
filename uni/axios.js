import axios from 'axios';
// 创建一个 Axios 实例
const instance = axios.create({
    baseURL: 'http://127.0.0.1:3000', // 替换为你的 API 基础 URL
    timeout: 3000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json',
        'Authorization':localStorage.getItem('token')
    },
});

// 添加请求拦截器
instance.interceptors.request.use(
    config => {
        // 在请求发送之前做些什么
        // 例如添加认证令牌
        // config.headers['Authorization'] = 'Bearer ' + yourToken;
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 添加响应拦截器
instance.interceptors.response.use(
    response => {
/*        if (response.status==401){
            console.log('401---')
            router.push({ name: 'login' }).catch(err => {
                console.error('Router push error:', err);
            });
        }*/
        // 对响应数据做些什么
        return response.data;
    },
    error => {
        // 对响应错误做些什么
        return Promise.reject(error);
    }
);

// 定义全局的 POST 请求方法

export const post = async (url, data, config = {}) => {
    try {
        let rsp=await instance.post(url, data,{    headers: {
                'Content-Type': 'application/json',
                'Authorization':localStorage.getItem('token')
            }});
        console.log( 'res-----',rsp)
        if (typeof rsp=='string'){
        }
        return rsp

    }catch (e){
        console.log( 'res-----',e)
/*        if (e.response.status==401){
            console.log('401---')
            router.push({ name: 'login' }).catch(err => {
                console.error('Router push error:', err);
            });
        }*/
        throw e.response.data
    }

};
// 你也可以定义其他全局请求方法，例如 GET
export const get = async (url,query) => {
    try {
/*        if (!localStorage.getItem('token')){
           router.push('login')
            return
        }*/
        let rsp=await instance.get(url, {params:query});
        console.log( 'res-----',rsp)
        return rsp

    }catch (e){
        console.log( 'res-----',e.message)
       // alert(e.response.data)
        throw e.response.data
    }
};

export default instance;
