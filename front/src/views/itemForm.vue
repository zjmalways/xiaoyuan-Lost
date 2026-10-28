<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { createItem, getItem, updateItem, updateItemImages, uploadItemImages } from '@/api/itemApi'
import { useAuth } from '@/utils/auth'
import { imageList, itemTypes } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const editing = Boolean(route.params.itemId)
const loading = ref(false)
const uploading = ref(false)
const photos = ref([])
const form = reactive({
  itemType: 6, publishType: 0, title: '', description: '', features: '',
  location: '', eventTime: '', contact: '', storageLocation: ''
})

async function loadItem() {
  if (!editing) {
    form.contact = user.value?.contact || ''
    return
  }
  loading.value = true
  try {
    const item = await getItem(route.params.itemId)
    if (Number(user.value?.role) !== 1 && Number(user.value?.userId) !== Number(item.publisherId)) {
      ElMessage.error('只有发布者或管理员可以编辑此物品')
      router.replace(`/items/${route.params.itemId}`)
      return
    }
    Object.assign(form, {
      itemType: Number(item.itemType), publishType: Number(item.publishType), title: item.title || '',
      description: item.description || '', features: item.features || '', location: item.location || '',
      eventTime: item.eventTime || '', contact: item.contact || '', storageLocation: item.storageLocation || ''
    })
    photos.value = imageList(item.images)
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

async function selectImages(event) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return
  if (photos.value.length + files.length > 9) return ElMessage.warning('最多可以上传 9 张图片')
  uploading.value = true
  try {
    const uploaded = await uploadItemImages(files)
    const urls = Array.isArray(uploaded) ? uploaded : uploaded?.imageUrls || uploaded?.urls || [uploaded?.url].filter(Boolean)
    if (!urls.length || urls.some(url => typeof url !== 'string')) throw new Error('图片上传响应格式不正确')
    photos.value.push(...urls)
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    uploading.value = false
  }
}

async function submit() {
  if (!form.title.trim() || !form.location.trim()) return ElMessage.warning('标题和地点为必填项')
  loading.value = true
  try {
    const payload = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      images: photos.value.join(',')
    }
    let id
    if (editing) {
      await updateItem({ ...payload, itemId: Number(route.params.itemId) })
      id = Number(route.params.itemId)
      await updateItemImages(id, photos.value)
    } else {
      const created = await createItem(payload)
      id = created?.itemId
      if (!id) throw new Error('物品已发布，但响应中没有返回物品编号')
    }
    ElMessage.success(editing ? '物品信息已保存' : '物品已发布')
    router.push(`/items/${id}`)
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadItem)
</script>

<template>
  <section class="form-page" v-loading="loading">
    <div class="form-heading"><el-button text @click="router.back()"><el-icon><ArrowLeft /></el-icon>返回</el-button><span class="eyebrow">SHARE A CLUE</span><h1>{{ editing ? '编辑物品信息' : '发布寻物信息' }}</h1><p>描述得越清楚，物品越容易和主人重逢。</p></div>
    <el-card class="form-card" shadow="never">
      <el-form :model="form" label-position="top" @submit.prevent="submit">
        <el-form-item label="信息类型" required><el-radio-group v-model="form.publishType" class="type-radio"><el-radio-button :value="0">我丢失了物品</el-radio-button><el-radio-button :value="1">我捡到了物品</el-radio-button></el-radio-group></el-form-item>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12"><el-form-item label="物品分类" required><el-select v-model="form.itemType" class="full-width"><el-option v-for="type in itemTypes" :key="type.value" :label="type.label" :value="type.value" /></el-select></el-form-item></el-col>
          <el-col :xs="24" :sm="12"><el-form-item label="物品名称" required><el-input v-model="form.title" maxlength="100" show-word-limit placeholder="例如：黑色蓝牙耳机" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="发生地点" required><el-input v-model="form.location" maxlength="200" placeholder="例如：图书馆二楼自习区" /></el-form-item>
        <el-form-item label="发生时间"><el-date-picker v-model="form.eventTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" placeholder="选择大致时间" class="full-width" /></el-form-item>
        <el-form-item label="详细描述"><el-input v-model="form.description" type="textarea" :rows="4" maxlength="2000" show-word-limit placeholder="描述事情经过、物品外观等信息" /></el-form-item>
        <el-form-item label="物品特征"><el-input v-model="form.features" maxlength="500" placeholder="颜色、品牌、贴纸等容易识别的特征" /></el-form-item>
        <el-form-item label="物品图片"><div class="photo-list"><div v-for="(photo, index) in photos" :key="photo" class="photo-thumb"><img :src="photo" alt="物品图片" /><el-button circle type="danger" size="small" :icon="Close" @click="photos.splice(index, 1)" /></div><label class="upload-tile"><input type="file" accept="image/*" multiple :disabled="uploading || photos.length >= 9" @change="selectImages" /><el-icon><Plus /></el-icon><span>{{ uploading ? '上传中…' : '添加图片' }}</span></label></div><div class="field-help">最多 9 张，支持常见图片格式</div></el-form-item>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12"><el-form-item label="联系方式"><el-input v-model="form.contact" maxlength="200" placeholder="微信、手机号等" /></el-form-item></el-col>
          <el-col :xs="24" :sm="12"><el-form-item label="物品存放地点"><el-input v-model="form.storageLocation" maxlength="200" placeholder="捡到的物品目前存放位置" /></el-form-item></el-col>
        </el-row>
        <div class="form-actions"><el-button @click="router.back()">取消</el-button><el-button type="primary" :loading="loading || uploading" @click="submit">{{ editing ? '保存修改' : '发布信息' }}</el-button></div>
      </el-form>
    </el-card>
  </section>
</template>
