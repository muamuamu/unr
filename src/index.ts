import deepcopy from 'deepcopy'
import { type ObjectDelta } from 'jsondiffpatch'
import { restore, diff, type TargetObj } from './lib'

class Und {
  #cacheData = {} as TargetObj
  #current = {} as TargetObj
  #stack = [] as Array<ObjectDelta>
  stack = [] as Array<ObjectDelta>
  #pIndex = 0
  #sLength = 0

  constructor(data: TargetObj, options = {}) {
    try {
      this.#current = data
      this.#cacheData = data
      this.save()
    }
    catch (e) {
      throw e
    }
  }

  get pointIndex() {
    return this.#pIndex
  }

  set pointIndex(value) {
    console.warn('pointIndex is not writeable')
  }

  get stackLength() {
    return this.#sLength
  }

  set stackLength(value) {
    console.warn('stackLength is not writeable')
  }

  get hasChange() {
    return !!this.diff()
  }

  save() {
    const delta = this.diff()
    if (!delta && this.#stack.length > 0) {
      return
    }
    this.stack = this.#stack = [...this.#stack.slice(0, this.#pIndex + 1), delta]
    this.setCache()
    this.setPointIndex()
  }

  undo() {
    if (this.#pIndex === 0) {
      return
    }
    this.reset()
    restore(this.#current, this.#stack[this.#pIndex--], true)
    this.setCache()
  }

  redo() {
    if (this.#pIndex === this.#stack.length - 1) {
      return
    }
    this.reset()
    restore(this.#current, this.#stack[++this.#pIndex], false)
    this.setCache()
  }

  reset() {
    const delta = this.diff()
    if (!delta) {
      return
    }
    restore(this.#current, delta, true)
  }

  patch(source: TargetObj) {
    if (!source) {
      return
    }
    const delta = this.diff(this.#current, source)
    if (!delta) {
      return
    }
    restore(this.#current, delta, false)
  }

  private diff(left = this.#cacheData, right = this.#current): ObjectDelta {
    return diff(left, right)
  }

  private setCache() {
    this.#cacheData = deepcopy(this.#current)
  }

  private setPointIndex() {
    this.#pIndex = this.#sLength = this.#stack.length - 1
  }
}

export default Und
