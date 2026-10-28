import axios from "axios";
import router from "@/router";
import { ElMessage } from "element-plus";


const request = axios.create({
    baseURL: "/api",
    timeout: 600000
})

//axios请求拦截器,在请求头中添加token,以便后端验证用户身份和验证登录信息
//文件上传并不能被拦截器捕获到,所以在上传文件的组件中需要单独设置请求头,添加token
//参照element-plus的上传组件的文档,在el-upload中添加属性headers，
// 在钩子函数中获取token到自定义响应式数据中再将响应式数据添加到header中设置请求头,添加token
// request.interceptors.request.use(
//     (config)=>{
//         const loginUser = JSON.parse(LocalStorage.getItem("token"));
//         if(loginUser && loginUser.token){
//             config.headers.Authorization = loginUser.token;
//         }
//         return config;
//     },
//     (error)=>{
//         return Promise.reject(error);
//     }
// )
//响应拦截器
request.interceptors.response.use(
    (response)=>{
        return response.data
    },
    (error)=>{
        // if(error.response.status === 401){
        //     //提示错误信息
        //     ElMessage.error("登录信息过期，请重新登录");
        //     //跳转到登录页面
        //     router.push("/login");
        // }else{
        //     ElMessage.error("接口状态异常");
        // }
        return Promise.reject(error);
    }
)

export default request