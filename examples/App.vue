<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import demo1 from './demo1.vue'
import demo2 from './demo2.vue'

const count = ref(0)
const components = shallowRef([demo1, demo2])
const selectComp = computed(() => components.value[count.value])

function change(i: number) {
  count.value = i
}
</script>

<template>
  <div>
    <div class="list">
      <div 
          v-for="(v, i) in components" 
          :key="i"
          :class="{ active: i === count }"
          @click="() => change(i)"
        >
        {{ `dome${i + 1}` }}
      </div>
    </div>
   <component :is="selectComp"></component>
  </div>
</template>

<style lang="scss">
  .list {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: fit-content;
    margin-bottom: 40px;
    border: 1px solid #333;
    border-radius: 70px;

    & > .active {
        background: #ffbfbf;
      }

    & > div {
      width: 70px;
      height: 40px;
      line-height: 40px;
      text-align: center;
    }
  }

  
</style>