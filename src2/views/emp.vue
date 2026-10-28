<script setup>
import { watch,ref } from 'vue'
const refData = ref();
watch(refData,(newVal,oldVal)=>{
  console.log(`refData变化了，新的值是${newVal},旧的值是${oldVal}`);
})

//侦听对象的变化
const objData = ref({
  name:'张三',
  age:18
})
watch(objData,(newVal,oldVal)=>{//侦听对象属性的变化
  console.log(`objData变化了，新的值是${newVal},旧值是${oldVal}`);
},{deep:true}) //深度监听对象的变化
//第三个参数可以是deep（boolean）是否开启深度监听，
// immediate（boolean） immediate表示是否立即执行一次回调函数，默认值为false

//侦听对象的单个属性
watch(()=>objData.value.name,(newVal,oldVal)=>{//侦听对象属性的变化
  console.log(`objData.name变化了，新的值是${newVal},旧值是${oldVal}`);
})//第一个参数传入一个函数，返回需要侦听的数据源

//总结：
/*watch函数调用时传入的参数：
1.侦听数据源：可以是一个ref对象，也可以是一个函数
2.回调函数：发生变化时的触发的回调函数
3.配置对象：可选，是一个对象，可以配置deep（boolean）是否开启深度监听，
immediate（boolean） immediate表示是否立即执行一次回调函数，默认值为false*/
</script>
<template>员工
watch侦听数据变化:
侦听ref响应式数据源的变化


//将超链接标签变为死链接的方法
<a href="javascript:;">超链接</a>
//或者
<a href="javascript:void(0)">超链接</a>
</template>
<style scoped></style>