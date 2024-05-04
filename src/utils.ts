import jsondiffpatch, { diff, ObjectDelta } from 'jsondiffpatch'

type TargetObj = Record<string, any>

type Restore = (target: TargetObj, handler: ObjectDelta, isUndo: boolean) => void

type RestoreAttrs<T = Delta> = (target: TargetObj, key: string, handler: T, isUndo?: boolean) => void

type AttrHandle = jsondiffpatch.ModifiedDelta | jsondiffpatch.AddedDelta | jsondiffpatch.DeletedDelta

type Delta = ReturnType<typeof diff>

type DeepFn = (target: TargetObj, handler: ObjectDelta, isUndo: boolean) => void

type ArrayDeltas = { [key: number]: Delta } & { index: number }

const isArray = Array.isArray

const isObject = (params: any) => Object.prototype.toString.call(params) === '[object Object]'

const isDel = (delta: Delta) => isArray(delta) && delta[1] === 0 && delta[2] === 0

const isAdd = (delta: Delta) => isArray(delta) && delta.length === 1

const isChange = (delta: Delta) => isArray(delta) && delta.length === 2

export const restore: Restore = (target, handler, isUndo) => {
  if (!handler) {
    return
  }

  deepQuery(target, handler, isUndo)
}

const deepQuery: DeepFn = (target, handler, isUndo = false) => {
  if (handler._t) {
    resetArray(target, handler, isUndo)
  }
  else {
    resetObject(target, handler, isUndo)
  }
}

const resetObject: DeepFn = (target, handler, isUndo = false) => {
  for (let key in handler) {
    const delta = handler[key]

    if (isObject(delta)) {
      deepQuery(target[key], delta as ObjectDelta, isUndo)
    }
    if (isArray(delta)) {
      restoreObjectAttr(target, key, delta as AttrHandle, isUndo)
    }
  }
}

const resetArray: DeepFn = (target, handler, isUndo = false) => {
  const deleteItems = []
  const addItems = []

  for (let key in handler) {
    const delta = handler[key]

    if (key === '_t') {
      continue
    }

    if (isObject(delta)) {
      deepQuery(target[key], delta as ObjectDelta, isUndo)
      continue
    }

    const o = {} as ArrayDeltas

    if (key.startsWith('_')) {
      const index = Number(key.slice(1))
      o[index] = delta
      o.index = index

      if (isDel(delta)) {
        deleteItems.push(o)
      }
    }
    else {
      const index = Number(key)
      o[index] = delta
      o.index = index
      addItems.push(o)
    }
  }

  addItems.sort((a, b) => a.index - b.index)
  deleteItems.sort((a, b) => a.index - b.index)

  removeArrayItems(target, isUndo ? addItems : deleteItems)
  insertArrayItems(target, isUndo ? deleteItems : addItems)
}

const insertArrayItems = (target: TargetObj, deltas: ArrayDeltas[]) => {
  for (let i = 0; i < deltas.length; i++) {
    const delta = deltas[i]
    const index = delta.index
    target.splice(index, 0, (delta[index] as any)[0])
  }
}

const removeArrayItems = (target: TargetObj, deltas: ArrayDeltas[]) => {
  for (let i = deltas.length - 1; i >= 0; i--) {
    target.splice(deltas[i].index, 1)
  }
}

const restoreObjectAttr: RestoreAttrs<AttrHandle> = (target, key, handler, isUndo) => {
  if (isAdd(handler)) {
    if (isUndo) {
      Reflect.deleteProperty(target, key)
    }
    else {
      Reflect.set(target, key, handler[0])
    }
  }

  if (isChange(handler)) {
    Reflect.set(target, key, handler[isUndo ? 0 : 1])
  }

  if (isDel(handler)) {
    if (isUndo) {
      Reflect.set(target, key, handler[0])
    }
    else {
      Reflect.deleteProperty(target, key)
    }
  }
}
