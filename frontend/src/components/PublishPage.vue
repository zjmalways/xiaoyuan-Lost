<script setup>
defineProps({
  form: { type: Object, required: true },
  types: { type: Object, required: true },
  previews: { type: Array, required: true },
})

const emit = defineEmits(['choose-images', 'submit'])
</script>

<template>
  <section class="page-view form-view">
    <p class="eyebrow">LEAVE A CLUE</p>
    <h1>发布一条线索</h1>
    <p class="lead">描述得越清楚，重逢就越近。</p>
    <form @submit.prevent="emit('submit')">
      <div class="form-row">
        <label>这是
          <select v-model="form.publishType">
            <option :value="0">我丢失的物品</option>
            <option :value="1">我拾到的物品</option>
          </select>
        </label>
        <label>物品类型
          <select v-model="form.itemType">
            <option v-for="(name, id) in types" :key="id" :value="Number(id)">{{ name }}</option>
          </select>
        </label>
      </div>
      <label>标题<input v-model="form.title" required placeholder="例如：黑色帆布双肩包"></label>
      <label>地点<input v-model="form.location" required placeholder="例如：图书馆三楼自习区"></label>
      <label>详细描述<textarea v-model="form.description" rows="4" placeholder="颜色、品牌、内含物品等..."></textarea></label>
      <label>物品特征<textarea v-model="form.features" rows="3" placeholder="留下只有失主知道的小细节"></textarea></label>
      <label>联系方式<input v-model="form.contact" placeholder="手机号、微信号或其他联系方式"></label>
      <div class="image-upload-field">
        <strong>物品图片</strong>
        <input type="file" accept="image/png,image/jpeg,image/webp" multiple @change="emit('choose-images', $event)">
        <div class="image-preview-list">
          <div v-for="url in previews" :key="url" class="image-preview">
            <img :src="url" alt="待上传图片">
          </div>
        </div>
      </div>
      <button class="primary-button">发布线索 ↗</button>
    </form>
  </section>
</template>
