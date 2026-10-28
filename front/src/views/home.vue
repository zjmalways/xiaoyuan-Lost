<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getItems } from '@/api/itemApi'
import { formatTime, imageList, itemTypes } from '@/utils/format'

const filters = reactive({ keyword: '', publishType: '', itemType: '', status: '' })
const page = ref(1)
const pageSize = 12
const total = ref(0)
const records = ref([])
const loading = ref(false)

async function loadItems() {
  loading.value = true
  try {
    const result = await getItems({
      pageNum: page.value,
      pageSize,
      keyword: filters.keyword || undefined,
      publishType: filters.publishType === '' ? undefined : filters.publishType,
      itemType: filters.itemType === '' ? undefined : filters.itemType,
      status: filters.status === '' ? undefined : filters.status
    })
    records.value = result.records || []
    total.value = Number(result.total || 0)
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  loadItems()
}

onMounted(loadItems)
</script>

<template>
  <section class="hero-panel">
    <div class="hero-copy">
      <span class="eyebrow">CAMPUS LOST & FOUND</span>
      <h1>丢失的物品，<br /><em>在这里重新相遇。</em></h1>
      <p>发布寻物启事，或看看有没有人拾到你的物品。</p>
      <el-button type="primary" round size="large" @click="$router.push('/items/new')">发布一条信息 <el-icon class="el-icon--right"><Right /></el-icon></el-button>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="art-sun"></div><div class="art-circle"></div>
      <div class="art-card"><el-icon><Key /></el-icon><span>物归原主</span></div>
      <div class="art-leaf leaf-one"></div><div class="art-leaf leaf-two"></div>
    </div>
    <div class="hero-stats"><span><strong>每一次拾获</strong> 都值得被看见</span><span class="stat-dot"></span><span>让善意在校园里传递</span></div>
  </section>

  <section class="section-block">
    <div class="section-heading">
      <div><span class="eyebrow">THE NOTICE BOARD</span><h2>校园寻物启事</h2><p>看看最近有哪些物品正在等待主人</p></div>
      <el-button text type="primary" @click="$router.push('/announcements')">查看校园公告 <el-icon><ArrowRight /></el-icon></el-button>
    </div>
    <div class="filter-panel">
      <el-input v-model="filters.keyword" clearable placeholder="搜索物品名称、描述或地点" @keyup.enter="search">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="filters.publishType" clearable placeholder="全部信息" @change="search">
        <el-option label="寻物启事" :value="0" /><el-option label="失物招领" :value="1" />
      </el-select>
      <el-select v-model="filters.itemType" clearable placeholder="全部分类" @change="search">
        <el-option v-for="type in itemTypes" :key="type.value" :label="type.label" :value="type.value" />
      </el-select>
      <el-select v-model="filters.status" clearable placeholder="全部状态" @change="search">
        <el-option label="正在寻找" :value="0" /><el-option label="已找回 / 归还" :value="1" />
      </el-select>
      <el-button type="primary" @click="search">搜索</el-button>
    </div>
    <div v-loading="loading" class="item-grid">
      <router-link v-for="item in records" :key="item.itemId" class="item-card" :to="`/items/${item.itemId}`">
        <div class="item-cover">
          <img v-if="imageList(item.images)[0]" :src="imageList(item.images)[0]" :alt="item.title" />
          <div v-else class="cover-placeholder"><el-icon><Box /></el-icon><span>{{ itemTypes.find(type => type.value === Number(item.itemType))?.label || '校园好物' }}</span></div>
          <span class="type-badge" :class="Number(item.publishType) === 1 ? 'found' : 'lost'">{{ Number(item.publishType) === 1 ? '失物招领' : '寻物启事' }}</span>
          <span v-if="Number(item.status) === 1" class="status-badge">已找回</span>
        </div>
        <div class="item-card-body">
          <div class="item-meta"><span>{{ itemTypes.find(type => type.value === Number(item.itemType))?.label || '其他' }}</span><span>{{ formatTime(item.createTime) }}</span></div>
          <h3>{{ item.title }}</h3>
          <p class="item-description">{{ item.description || item.features || '暂无详细描述' }}</p>
          <div class="item-location"><el-icon><Location /></el-icon>{{ item.location || '地点未填写' }}</div>
        </div>
      </router-link>
    </div>
    <el-empty v-if="!loading && !records.length" description="暂时没有找到相关信息，换个关键词试试吧" />
    <div v-if="total > pageSize" class="pagination-wrap">
      <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="prev, pager, next" @current-change="loadItems" />
    </div>
  </section>
</template>
