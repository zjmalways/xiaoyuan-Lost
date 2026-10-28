import { createRouter, createWebHistory } from 'vue-router'
import Index from "@/views/index.vue";
import Emp from '@/views/emp.vue';
import Stu from '@/views/stu.vue';
import Dept from '@/views/dept.vue';
import Class from '@/views/class.vue';
import Stutj from '@/views/stutj.vue';
import Depttj from '@/views/depttj.vue';
import Login from '@/views/login.vue';
import Home from '@/views/5_19.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '',
      component: Home,
      redirect: '/index',
      children: [
        {path: '/index',name: 'index',component: Index},
        {path: '/emp',name: 'emp',component: Emp},
        {path: '/stu',name: 'stu',component: Stu},
        {path: '/dept',name: 'dept',component: Dept},
        {path: '/class',name: 'class',component: Class},
        {path: '/stutj',name: 'stutj',component: Stutj},
        {path: '/depttj',name: 'depttj',component: Depttj},
      ]
    },
    {path: '/login',name: 'login',component: Login},
  ]
})

export default router
