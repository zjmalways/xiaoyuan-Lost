<script setup>
defineProps({
  item: { type: Object, required: true },
  images: { type: Array, required: true },
  previews: { type: Array, required: true },
})

const emit = defineEmits(['back', 'choose-images', 'remove-image', 'save'])
</script>

<template>
  <section class="page-view form-view">
    <button class="back-link" @click="emit('back')">← 返回详情</button>
    <p class="eyebrow">REFINE YOUR CLUE</p>
    <h1>编辑线索</h1>
    <form @submit.prevent="emit('save')">
      <label>标题<input v-model="item.title" required></label>
      <label>地点<input v-model="item.location" required></label>
      <label>详细描述<textarea v-model="item.description" rows="4"></textarea></label>
      <label>物品特征<textarea v-model="item.features" rows="3"></textarea></label>
      <label>联系方式<input v-model="item.contact"></label>
      <div class="image-upload-field">
        <strong>物品图片</strong>
        <input type="file" accept="image/png,image/jpeg,image/webp" multiple @change="emit('choose-images', $event)">
        <div class="image-preview-list">
          <div v-for="url in images" :key="url" class="image-preview">
            <img :src="url" alt="已上传图片">
            <button type="button" @click="emit('remove-image', url)">删除</button>
          </div>
          <div v-for="url in previews" :key="url" class="image-preview">
            <img :src="url" alt="待上传图片">
          </div>
        </div>
      </div>
      <button class="primary-button">保存修改 ↗</button>
    </form>
  </section>
</template>
