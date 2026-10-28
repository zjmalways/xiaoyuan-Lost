<script setup>
import { ref,onMounted } from 'vue';
import { addDept,queryApi,queryByIdApi,updateDeptApi,deleteDeptApi } from '@/api/deptApi';
import { ElMessage,ElMessageBox } from 'element-plus'
//钩子函数
onMounted(()=>{
    select();
})
const button1 = { type: 'primary', text: '编辑' };
const button2 = { type: 'danger', text: '删除' };

const deptList = ref([]);
const dept = ref({name: ''})
const formtitle = ref('');
const select = async () => {
    const result = await queryApi();
    if(result.code==1){//Js隐式转换，0-false，其他数字-true；'' false，其他-true；null，undefined-false
        deptList.value = result.data;
    }
}
//新增部门
const add = ()=>{
    dialogFormVisible.value = true;
    formtitle.value = '新增部门';
    dept.value = {name: ''};
    //重置表单校验
    if (deptFormRef.value){
        deptFormRef.value.resetFields();
    }
}
// 对话框组件
const dialogFormVisible = ref(false);

const save = async () => {//添加部门，确认保存
    let result;
    if(!dept.value.id){
        result = await addDept(dept.value);
    }else{
        result = await updateDeptApi(dept.value);
    }
    if(result.code){
        dialogFormVisible.value = false;
        ElMessage.success('操作成功');
        select();
    }else{
        ElMessage.error(result.error+'操作失败');
    }
    dept.value.name='';
}
//表单校验
const rules = ref({
    name: [
        { required: true, message: '该项为必填项', trigger: 'blur' },
        { min: 2, max: 10, message: '名称长度必须在2-10之间', trigger: 'blur' },
    ]
})
const deptFormRef = ref();
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      save();
    } else {
      ElMessage.error('操作失败');
    }
  })
}

//修改部门：查询回显
const queryById = async (id)=>{
    dialogFormVisible.value = true;
    formtitle.value = "编辑部门"
    if (deptFormRef.value){
        deptFormRef.value.resetFields();
    }
    const result = await queryByIdApi(id);
    if(result.code){
        dept.value = result.data;
    }else{
        console.log(result.error);
    }
}
//删除部门
//确认
const open = (id) => {
  ElMessageBox.confirm(
    '确认删除该条数据？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const result = await deleteDeptApi(id);
      if(result.code){
        ElMessage.success('操作成功');
        select();
        }
        else{
            ElMessage.error('操作失败');
            console.log(result.error);
        }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消操作',
      })
    })
}
</script>
<template>
    <h3>部门管理</h3>
    <div class="d1">
        <el-button type="primary" @click="add">  +  新增部门</el-button>
    </div>
<el-table :data="deptList" border style="width: 100%">
    <el-table-column type="index" label="序号" width="100px" align="center" />
    <el-table-column prop="name" label="部门名称" width="150px" align="center" />
    <el-table-column prop="updateTime" label="最后操作时间" width="400px" align="center" />
    <el-table-column label="操作" align="center" >
        <template #default="scope">
            <el-button
            :key="button1.text"
            :type="button1.type"
            text
            @click="queryById(scope.row.id)"
            >
            <el-icon><EditPen /></el-icon>{{ button1.text }}
            </el-button>
            <el-button
            :key="button2.text"
            :type="button2.type"
            text
            plain
            @click="open(scope.row.id)"
            >
            <el-icon><Delete /></el-icon>{{ button2.text }}
            </el-button>
        </template>
    </el-table-column>
</el-table>

<!-- dialog组件 -->
<el-dialog v-model="dialogFormVisible" :title="formtitle" width="500">
<el-form :model="dept" :rules="rules" ref="deptFormRef">
    <el-form-item label="部门名称" label-width="80px" prop="name">
    <el-input v-model="dept.name"/>
    </el-form-item>
</el-form>
<template #footer>
    <div class="dialog-footer">
    <el-button @click="dialogFormVisible = false">取消</el-button>
    <el-button type="primary" @click="submitForm(deptFormRef)" class="!ml-0" :plain="true">
        确认
    </el-button>
    </div>
</template>
</el-dialog>
</template>
<style scoped>
.d1{
    margin: 10px 0px;
}
</style>