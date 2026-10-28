import request from '@/utils/dept'

//查询全部部门
export const queryApi = ()=>{
    return request.get("/classes")
}

//添加部门
export const addDept = (dept)=>{
    return request.post("/classes",dept);
}

//查询回显
export const queryByIdApi = (id)=>{
    return request.get(`/classes/${id}`);
}

//修改部门
export const updateDeptApi = (dept)=>{
    return request.put("/classes",dept);
}

//删除部门
export const deleteDeptApi = (id)=>{
    return request.delete(`/classes?id=${id}`);
}