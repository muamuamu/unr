import jsondiffpatch, { AddedDelta, diff, ObjectDelta } from 'jsondiffpatch'

type Obj = Record<string, any>

type Restore = (target: Obj, handler: ObjectDelta, isUndo: boolean) => void

type RestoreAttrs<T = Delta> = (target: Obj, key: string, handler: T, isUndo?: boolean) => void

type AttrHandle = jsondiffpatch.ModifiedDelta | jsondiffpatch.AddedDelta | jsondiffpatch.DeletedDelta

export type Delta = ReturnType<typeof diff>

export type DeepFn = (target: Obj, handler: ObjectDelta, isUndo: boolean, callback: RestoreAttrs) => void

export type ArrayDeltas = { [key: number]: Delta } & { _index: number }

export const isArray = Array.isArray

export const isObject = (params: any) => Object.prototype.toString.call(params) === '[object Object]'

export const restore: Restore = (target, handler, isUndo) => {
  if (!handler) {
    return
  }

  deepQuery(
    target,
    handler,
    isUndo,
    (handleTarget, key, handerDelta) => {
      restoreObjectAttr(handleTarget, key, handerDelta as AttrHandle, isUndo)
    })
}

export const restoreObjectAttr: RestoreAttrs<AttrHandle> = (target, key, handler, isUndo) => {
  if (handler.length === 1) {
    if (isUndo) {
      Reflect.deleteProperty(target, key)
    }
    else {
      Reflect.set(target, key, handler[0])
    }
  }

  if (handler.length === 2) {
    Reflect.set(target, key, handler[isUndo ? 0 : 1])
  }

  if (handler.length === 3 && handler[1] === 0 && handler[1] === 0) {
    if (isUndo) {
      Reflect.set(target, key, handler[0])
    }
    else {
      Reflect.deleteProperty(target, key)
    }
  }
}

const sortDeltaArray: DeepFn = (target, handler, isUndo = false, callback) => {
  if (!handler._t) {
    return
  }

  const deleteItems = []
  const addItems = []
  // const moveItems = []

  for (let key in handler) {
    const delta = handler[key]
    if (key === '_t') {
      continue
    }

    if (isObject(delta)) {
      deepQuery(target[key], delta as ObjectDelta, isUndo, callback)
      continue
    }
    const o = {} as ArrayDeltas
    if (key.startsWith('_')) {
      const index = Number(key.slice(1))
      o[index] = delta
      o._index = index

      if (isDelete(delta)) {
        deleteItems.push(o)
      }

      // if (isMove(delta)) {
      //   moveItems.push(o)
      // }
    }
    else {
      const index = Number(key)
      o[index] = delta
      o._index = Number(index)
      addItems.push(o)
    }
  }

  addItems.sort((a, b) => a._index - b._index)
  // moveItems.sort((a, b) => a._index - b._index)
  deleteItems.sort((a, b) => a._index - b._index)

  if (isUndo) {
    removeArrayItems(target, addItems)
    insertArrayItems(target, deleteItems)
  }
  else {
    // todo
    removeArrayItems(target, deleteItems)
    insertArrayItems(target, addItems)
  }
}

const insertArrayItems = (target: Obj, deltas: ArrayDeltas[]) => {
  for (let i = 0; i < deltas.length; i++) {
    let delta = deltas[i]
    let index = delta._index
    target.splice(index, 0, (delta[index] as any)[0])
  }
}

const removeArrayItems = (target: Obj, deltas: ArrayDeltas[]) => {
  for (let i = deltas.length - 1; i >= 0; i--) {
    target.splice(deltas[i]._index, 1)
  }
}

const deepQuery: DeepFn = (target, handler, isUndo = false, callback) => {
  if (handler._t) {
    sortDeltaArray(target, handler, isUndo, callback)
    return
  }

  /* if (handler._t) {
    const keys: string[] = []
    for (let key in handler) {
      const delta = handler[key]
      if (isObject(delta)) {
        deepQuery(target[key], delta as ObjectDelta, isUndo, callback)
      }

      if (key === '_t' || keys.includes(key) || !isArray(delta)) {
        continue
      }

      if (key.startsWith('_')) {
        const fkey = key.slice(1)
        if (handler[fkey]) {
          // change item
          eidtArrayItem(target, handler[fkey], delta, key, fkey, keys, isUndo)
        }
        else {
          if (isDelete(delta)) {
            // remove item
            removeArrayItem(target, fkey, delta[0], isUndo)
          }
          else {
            // todo
            // move item
          }
        }
      }
      else {
        const f = `_${key}`
        if (handler[f]) {
          eidtArrayItem(target, delta, handler[f], f, key, keys, isUndo)
        }
        else {
          addArrayItem(target, key, delta[0], isUndo)
        }
      }
    }
    return
  } */
  for (let key in handler) {
    const delta = handler[key]

    if (isObject(delta)) {
      deepQuery(target[key], delta as ObjectDelta, isUndo, callback)
    }
    if (isArray(delta)) {
      callback(target, key, delta)
    }
  }
}

const addArrayItem = (target: Obj, key: string, value: any, isUndo: boolean) => {
  if (isUndo) {
    target.splice(key, 1)
  }
  else {
    target.splice(key, 0, value)
  }
}

const removeArrayItem = (target: Obj, key: string, value: any, isUndo: boolean) => {
  if (isUndo) {
    target.splice(key, 0, value)
  }
  else {
    target.splice(key, 1)
  }
}

const eidtArrayItem = (
  target: Obj,
  addDelta: Delta,
  deleteDelta: Delta,
  key: string,
  fkey: string,
  keys: string[],
  isUndo: boolean,
) => {
  if (isUndo) {
    Reflect.set(target, fkey, deleteDelta![0])
    // target.splice(fkey, 1, deleteDelta![0])
  }
  else {
    Reflect.set(target, fkey, addDelta![0])
    // target.splice(fkey, 1, addDelta![0])
  }
  keys.push(key)
  keys.push(fkey)
}

const isDelete = (delta: Delta) => {
  return isArray(delta) && delta[1] === 0 && delta[2] === 0
}

const isAdd = (delta: Delta) => {
  return isArray(delta) && delta.length === 1
}

const isMove = (delta: Delta) => {
  return isArray(delta) && delta[2] === 3
}
