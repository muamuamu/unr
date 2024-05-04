<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import Unr from '../src'

const textValue = ref('')
const canUndo = ref(false)
const canRedo = ref(false)
const canReset = ref(false)
const isErr = ref('')

const parseJson = computed(() => {
  try {
    isErr.value = ''
    return JSON.parse(textValue.value)  
  } catch(e: any) {
    isErr.value = e.message
    return null
  }
})

const data = {
  color: 'red',
  name: 'red',
  children: [
    {
      color: 'green',
      name: 'green'
    },
    {
      color: 'black',
      name: 'black'
    },
  ]
} as any

const reactData = reactive(data)
const handler = new Unr(reactData)

watch(
  () => reactData,
  () => {
    setStatus()
  },
  { deep: true, immediate: true }
)

function setStatus() {
  canUndo.value = handler.pointIndex === 0
  canRedo.value = handler.pointIndex === handler.stackLength
  canReset.value = handler.hasChange()
}


changeData()

function changeData() {
  reactData.color = '4566'
  delete reactData.name
  reactData.children.push({
    color: 'blue',
    name: 'blue'
  })

  textValue.value = JSON.stringify(data, null, "  ")
}

function change() {
  handler.patch(parseJson.value)
}

function saveClick() {
  handler.patch(parseJson.value)
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

</script>

<template>
  <div>
    <div v-if="isErr" style="color: red;">error:{{ isErr }}</div>
    <textarea 
      v-model="textValue" 
      @input="change"
      :style="[isErr && 'border: 1px solid red', isErr && 'outline: 1px solid red']" 
      cols="30" 
      rows="35"
    />
    <div>
      <button @click="saveClick" :disabled="!!isErr || !canReset">save</button>
      <button @click="resetClick" :disabled="!!isErr || !canReset">reset</button>
      <button @click="undoClick" :disabled="!!isErr || canUndo">←undo</button>
      <button @click="redoClick" :disabled="!!isErr || canRedo">redo→</button>
    </div>
  </div>
</template>