import { createApp } from 'vue'
import {
  ElAlert,
  ElAvatar,
  ElButton,
  ElCard,
  ElCarousel,
  ElCarouselItem,
  ElCol,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElDivider,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElLoading,
  ElOption,
  ElPagination,
  ElRadioButton,
  ElRadioGroup,
  ElRow,
  ElSelect,
  ElSwitch,
  ElTag
} from 'element-plus'
import 'element-plus/dist/index.css'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  ChatDotRound,
  ChatLineRound,
  Close,
  EditPen,
  Key,
  Location,
  Lock,
  Phone,
  Plus,
  Promotion,
  Right,
  Search,
  Service,
  UserFilled,
  VideoPause
} from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(router)
const components = [
  ElAlert,
  ElAvatar,
  ElButton,
  ElCard,
  ElCarousel,
  ElCarouselItem,
  ElCol,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElDivider,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElOption,
  ElPagination,
  ElRadioButton,
  ElRadioGroup,
  ElRow,
  ElSelect,
  ElSwitch,
  ElTag
]

components.forEach(component => app.use(component))
app.directive('loading', ElLoading.directive)

const icons = {
  ArrowLeft, ArrowRight, Box, ChatDotRound, ChatLineRound, Close, EditPen, Key,
  Location, Lock, Phone, Plus, Promotion, Right, Search, Service, UserFilled, VideoPause
}

for (const [name, component] of Object.entries(icons)) app.component(name, component)

app.mount('#app')
