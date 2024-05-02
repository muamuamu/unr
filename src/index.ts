import deepcopy from 'deepcopy'
import jsondiffpatch, { diff, create, type ObjectDelta } from 'jsondiffpatch'
import { restore, type Delta } from './utils'

export type DataProps = Record<string, any>

const jsondiffpatchInstance = create({ arrays: { detectMove: false } })

class Und {
  #cacheData = {} as DataProps
  #current = {} as DataProps
  stack = [] as Array<ObjectDelta>
  pointIndex = 0

  constructor(data: DataProps, options = {}) {
    try {
      this.#current = data
      this.#cacheData = data
      this.save()
    }
    catch (e) {
      throw e
    }
  }

  save() {
    const delta = this.diff() as ObjectDelta
    if (!delta && this.stack.length > 0) {
      return
    }
    this.stack = [...this.stack.slice(0, this.pointIndex + 1), delta]
    this.setCache()
    this.setPointIndex()
  }

  undo() {
    if (this.pointIndex === 0) {
      return
    }
    this.reset()
    restore(this.#current, this.stack[this.pointIndex--], true)
    this.setCache()
  }

  redo() {
    if (this.pointIndex === this.stack.length - 1) {
      return
    }
    this.reset()
    restore(this.#current, this.stack[++this.pointIndex], false)
    this.setCache()
  }

  reset() {
    const delta = this.diff() as ObjectDelta
    if (!delta) {
      return
    }
    restore(this.#current, delta, true)
  }

  private diff() {
    return jsondiffpatchInstance.diff(this.#cacheData, this.#current)
  }

  private setCache() {
    this.#cacheData = deepcopy(this.#current)
  }

  private setPointIndex(index?: number) {
    this.pointIndex = index ?? this.stack.length - 1
  }
}

export default Und
