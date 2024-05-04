<script setup lang="ts">
defineOptions({
  name: 'Tree'
})

export type TreeProps = {
  id: string
  name: string
  color: string
  children?: TreeProps[]
}
defineProps<{data: TreeProps, selectId?: string, parent?: TreeProps}>()

const emit = defineEmits<{
  onClick: [data: TreeProps, parent?: TreeProps]
}>()

function onClick(data: TreeProps, parent?: TreeProps) {
  emit('onClick', data, parent)
}
</script>

<template>
  <div 
    class="tree" 
    :style="[
      data.color && `background: ${data.color}`,
      selectId === data.id && 'outline: 5000px solid rgba(0,0,0,.7)'
    ]"
    @click.stop="() => onClick(data, parent)"
  >
    <div>id: {{ data.id }}</div>
    <div>name: {{ data.name }}</div>
    <div>color: {{ data.color }}</div>
    <div v-if="data.children && data.children.length">
      <Tree 
        v-for="item in data.children" 
        :data="item" 
        :parent="data"
        :selectId="selectId"
        :key="item.id"
        @onClick="(e: TreeProps, p?: TreeProps) => onClick(e, p)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tree {
  padding: 20px;
}
</style>