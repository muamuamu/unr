<script setup lang="ts">
import { ref, reactive, watch, onUnmounted } from 'vue'
import Unr from '../src'
import Tree, { type TreeProps } from './Tree.vue'

const data = reactive<TreeProps>({
  id: '1',
  name: '1',
  color: '#ee7777',
  children: [
    {
      id: '1-1',
      name: '1-1',
      color: '#3d6b3e',
      children: [
          {
            id: '1-1-1',
            name: '1-1-1',
            color: '#b3e5b5',
            children: [
              
            ]
          }
      ]
    },
    {
      id: '1-2',
      name: '1-2',
      color: '#9ea35c',
      children: [
        
      ]
    },
  ]
})

const handler = new Unr(data)
const canUndo = ref(false)
const canRedo = ref(false)
const canReset = ref(false)
const selectData = ref<TreeProps | undefined>(undefined)
const selectDataParent = ref<TreeProps | undefined>(undefined)

watch(
  () => data,
  () => {
    setStatus()
  },
  { deep: true, immediate: true }
)

onUnmounted(() => {
  document.removeEventListener('click', clearSelect)
})

document.addEventListener('click', clearSelect)

function clearSelect() {
  selectData.value = undefined
  selectDataParent.value = undefined
}

function setStatus() {
  canUndo.value = handler.pointIndex === 0
  canRedo.value = handler.pointIndex === handler.stackLength
  canReset.value = handler.hasChange
}

function select(data: TreeProps, parent?: TreeProps) {
  selectData.value = data
  selectDataParent.value = parent
}

function saveClick() {
  handler.save()
  setStatus()
}

function resetClick() {
  handler.reset()
}

function undoClick() {
  handler.undo()
}

function redoClick() {
  handler.redo()
}

function del() {
  if(confirm(`delete: ${selectData.value?.name}?`)) {

    if(selectDataParent.value) {
      const index = selectDataParent.value.children!.findIndex(child => child === selectData.value)
      selectDataParent.value.children!.splice(index, 1)
    }
  }
}

function create() {
  const parent = selectData.value

  if(parent) {
    const id = parent.id + `-${(parent.children = parent.children || []).length + 1}`
    const newData = {
      id: id,
      name: id,
      color: '#ffffff',
      children: []
    }
    parent.children.push(newData)

    setTimeout(() => {
      select(newData, parent)
    })
  }
}
</script>

<template>
  <div>
    <div class="container">
      <div class="editor">
        <div>selected id: <span v-if="selectData" :style="`color: ${selectData.color}`">{{ selectData.id }}</span></div>
        <div>
          <button @click="undoClick" :disabled="canUndo">←undo</button>
          <button @click="redoClick" :disabled="canRedo">redo→</button>
          <button @click="saveClick" :disabled="!canReset">save</button>
          <button @click="resetClick" :disabled="!canReset">reset</button>
          <button @click="del" style="background: red;color: #fff;">delete</button>
          <button @click="create" style="background: green;color: #fff;">create</button>
        </div>
        <div style="overflow: hidden;">
          <Tree :data="data" :selectId="selectData?.id" @onClick="select" />
        </div>
      </div>
      <div class="config">
        <ul v-if="selectData">
          <li>
            <label>name:</label>
            <input type="text" v-model="selectData.name">
          </li>
          <li>
            <label>color:</label>
            <input type="color" v-model="selectData.color">
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.container {
  display: flex;
  border: 1px solid #333;

  & > .editor {
    flex: 1;
  }

  & > .config {
    width: 20%;
    border-left: 1px solid #666;

    li {
      margin-bottom: 20px;

      input {
        width: 90%;
      }
    }
  }
}
</style>