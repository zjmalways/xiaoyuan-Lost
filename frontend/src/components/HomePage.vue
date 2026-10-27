<script setup>
defineProps({
  items: { type: Array, required: true },
  total: { type: Number, required: true },
  page: { type: Number, required: true },
  pages: { type: Number, required: true },
  loading: { type: Boolean, required: true },
  error: { type: String, default: '' },
  search: { type: String, required: true },
  filter: { type: String, required: true },
  typeFilter: { type: String, required: true },
  statusFilter: { type: String, required: true },
  types: { type: Object, required: true },
  date: { type: Function, required: true },
  imageUrlList: { type: Function, required: true },
})

const emit = defineEmits(['update:search', 'search', 'filter', 'type-filter', 'status-filter', 'page', 'open', 'publish'])
</script>

<template>
  <section>
    <div class="hero">
      <div>
        <p class="eyebrow">A LITTLE KINDNESS, A BIG RETURN</p>
        <h1>让遗失的物品，<br><em>回到它的主人身边。</em></h1>
        <p class="hero-text">留下线索，也留下善意。每一次发布，都可能成为一场温柔的重逢。</p>
        <button class="primary-button" @click="emit('publish')">发布一条线索 ↗</button>
      </div>
      <div class="hero-art">
        <div class="sun"></div>
        <div class="art-card card-back"></div>
        <div class="art-card card-front">
          <small>TODAY'S FIND</small><strong>一枚校园卡</strong><span>南门 · 09:10</span><i>↗</i>
        </div>
      </div>
    </div>

    <div class="section-heading">
      <div>
        <p class="eyebrow">EXPLORE THE CAMPUS</p>
        <h2>正在寻找的物品</h2>
      </div>
      <span>共 {{ total }} 条线索 · 第 {{ page }} / {{ pages }} 页</span>
    </div>

    <div class="filters">
      <div class="search-box">
        ⌕
        <input :value="search" placeholder="搜索物品、地点或特征"
          @input="emit('update:search', $event.target.value)" @keyup.enter="emit('search')">
        <button class="search-submit" @click="emit('search')">搜索</button>
      </div>
      <div class="filter-controls">
        <div class="filter-tabs">
          <button :class="{ selected: filter === '' }" @click="emit('filter', '')">全部</button>
          <button :class="{ selected: filter === '0' }" @click="emit('filter', '0')">我丢失的</button>
          <button :class="{ selected: filter === '1' }" @click="emit('filter', '1')">我捡到的</button>
        </div>
        <label class="filter-select">分类
          <select :value="typeFilter" aria-label="按物品分类筛选" @change="emit('type-filter', $event.target.value)">
            <option value="">全部分类</option>
            <option v-for="(name, id) in types" :key="id" :value="id">{{ name }}</option>
          </select>
        </label>
        <label class="filter-select">状态
          <select :value="statusFilter" aria-label="按找回状态筛选" @change="emit('status-filter', $event.target.value)">
            <option value="">全部状态</option>
            <option value="0">待找回 / 待归还</option>
            <option value="1">已找回 / 已归还</option>
          </select>
        </label>
      </div>
    </div>

    <div v-if="loading" class="empty-state">正在加载线索...</div>
    <div v-else-if="error" class="empty-state error-state">
      {{ error }}<button class="text-button" @click="emit('search')">重新加载</button>
    </div>
    <div v-else-if="!items.length" class="empty-state">没有找到匹配的线索。</div>
    <div v-else class="item-grid">
      <article v-for="item in items" :key="item.itemId" class="item-card" @click="emit('open', item)">
        <div class="item-image" :class="`tone-${item.itemId % 4}`">
          <img v-if="imageUrlList(item.images).length" class="item-cover" :src="imageUrlList(item.images)[0]"
            :alt="item.title" loading="lazy" decoding="async">
          <span>{{ item.publishType === 0 ? 'LOST' : 'FOUND' }}</span>
          <b>{{ types[item.itemType] || '物品' }}</b>
        </div>
        <div class="item-content">
          <div class="item-meta">
            <span :class="['tag', item.publishType === 0 ? 'lost' : 'found']">
              {{ item.publishType === 0 ? '寻找失物' : '拾到物品' }}
            </span>
            <span>{{ Number(item.status) === 1 ? '已找回 / 已归还' : date(item.eventTime) }}</span>
          </div>
          <h3>{{ item.title }}</h3>
          <p class="location">⌖ {{ item.location }}</p>
          <p class="description">{{ item.description }}</p>
          <div class="item-footer">
            <span>{{ item.publisherName || '匿名同学' }}</span>
            <span>♡ {{ item.commentCount || 0 }}</span>
          </div>
        </div>
      </article>
    </div>
    <div v-if="pages > 1" class="pagination">
      <button :disabled="page === 1" @click="emit('page', page - 1)">← 上一页</button>
      <span>第 {{ page }} / {{ pages }} 页</span>
      <button :disabled="page === pages" @click="emit('page', page + 1)">下一页 →</button>
    </div>
  </section>
</template>
