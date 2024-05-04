import deepcopy from 'deepcopy'
import { create, type ObjectDelta } from 'jsondiffpatch'
import { restore } from './utils'

type DataProps = Record<string, any>

const jsondiffpatchInstance = create({ arrays: { detectMove: false } })

class Und {
  #cacheData = {} as DataProps
  #current = {} as DataProps
  #stack = [] as Array<ObjectDelta>
  pointIndex = 0
  stackLength = 0

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
    const delta = this.diff()
    if (!delta && this.#stack.length > 0) {
      return
    }
    this.#stack = [...this.#stack.slice(0, this.pointIndex + 1), delta]
    this.setCache()
    this.setPointIndex()
  }

  undo() {
    if (this.pointIndex === 0) {
      return
    }
    this.reset()
    restore(this.#current, this.#stack[this.pointIndex--], true)
    this.setCache()
  }

  redo() {
    if (this.pointIndex === this.#stack.length - 1) {
      return
    }
    this.reset()
    restore(this.#current, this.#stack[++this.pointIndex], false)
    this.setCache()
  }

  reset() {
    const delta = this.diff()
    if (!delta) {
      return
    }
    restore(this.#current, delta, true)
  }

  patch(source: DataProps) {
    if (!source) {
      return
    }
    const delta = this.diff(this.#current, source)
    if (!delta) {
      return
    }
    restore(this.#current, delta, false)
  }

  hasChange() {
    return !!this.diff()
  }

  private diff(left = this.#cacheData, right = this.#current) {
    return jsondiffpatchInstance.diff(left, right) as ObjectDelta
  }

  private setCache() {
    this.#cacheData = deepcopy(this.#current)
  }

  private setPointIndex(index?: number) {
    this.stackLength = this.#stack.length - 1
    this.pointIndex = index ?? this.stackLength
  }
}

export default Und
