import { describe, expect, it } from 'vitest'
import Und from '../src'
import deepcopy from 'deepcopy'

describe('show data', function () {
  const data = { a: 1 } as any
  const handler = new Und(data)

  it('add stack', function () {
    data.a = 2
    handler.save()
    data.a = 3
    handler.save()
    data.a = 4
    handler.save()
    expect(handler).toMatchInlineSnapshot(`
      Und {
        "stack": [
          undefined,
          {
            "a": [
              1,
              2,
            ],
          },
          {
            "a": [
              2,
              3,
            ],
          },
          {
            "a": [
              3,
              4,
            ],
          },
        ],
      }
    `)
    handler.pointIndex = 2
    data.a = 5
    handler.save()
    expect(handler).toMatchInlineSnapshot(`
      Und {
        "stack": [
          undefined,
          {
            "a": [
              1,
              2,
            ],
          },
          {
            "a": [
              2,
              3,
            ],
          },
          {
            "a": [
              3,
              4,
            ],
          },
          {
            "a": [
              4,
              5,
            ],
          },
        ],
      }
    `)
  })
})

describe('test object attribute', function () {
  const data = {
    a: 1,
  } as any
  const handler = new Und(data)
  it('test undo redo', function () {
    data.a = 2
    handler.save()
    expect(handler.pointIndex).toBe(1)
    expect(data).toEqual(
      {
        a: 2,
      },
    )

    data.a = 3
    handler.save()
    expect(handler.pointIndex).toBe(2)
    expect(data).toEqual(
      {
        a: 3,
      },
    )

    handler.undo()
    expect(handler.pointIndex).toBe(1)
    expect(data).toEqual(
      {
        a: 2,
      },
    )

    handler.undo()
    expect(handler.pointIndex).toBe(0)
    expect(data).toEqual(
      {
        a: 1,
      },
    )

    handler.redo()
    expect(handler.pointIndex).toBe(1)
    expect(data).toEqual(
      {
        a: 2,
      },
    )

    data.a = 4
    handler.save()
    expect(handler.pointIndex).toBe(2)
    expect(data).toEqual(
      {
        a: 4,
      },
    )

    handler.undo()
    expect(handler.pointIndex).toBe(1)
    expect(data).toEqual(
      {
        a: 2,
      },
    )

    handler.redo()
    expect(handler.pointIndex).toBe(2)
    expect(data).toEqual(
      {
        a: 4,
      },
    )
  })

  it('reset data', function () {
    data.a = 5
    data.b = 6
    delete data.a
    expect(data).toMatchInlineSnapshot(`
      {
        "b": 6,
      }
    `)
    handler.reset()
    expect(data).toEqual(
      {
        a: 4,
      },
    )
  })
})

describe('test array', function () {
  it('array reset', function () {
    const o1 = { a: 1, b: { c: 2 } } as any
    const arr = [2, o1, 7, 4] as any
    const clone = deepcopy(arr)
    const handler = new Und(arr)

    o1.a = 3
    o1.b.d = 5
    arr.splice(1, 1)
    arr.splice(0, 1, 8)
    arr.splice(0, 0, { b: 1 })
    arr[3] = 4

    expect(arr).toMatchInlineSnapshot(`
      [
        {
          "b": 1,
        },
        8,
        7,
        4,
      ]
    `)
    handler.reset()
    expect(arr).toMatchInlineSnapshot(`
      [
        2,
        {
          "a": 1,
          "b": {
            "c": 2,
          },
        },
        7,
        4,
      ]
    `)

    // expect(arr[1] === o1).toBeTruthy()
    expect(arr).toStrictEqual(clone)
  })

  it('test undo redo', function () {
    const o2 = { a: 1, b: { c: 2 } } as any
    const arr = [1, o2, 3] as any
    const clone = deepcopy(arr)
    const handler = new Und(arr)

    o2.a = 2
    handler.save()
    expect(handler.pointIndex).toBe(1)

    arr[0] = 3
    o2.b.d = 3
    const o3 = deepcopy(arr)
    handler.save()
    expect(handler.pointIndex).toBe(2)
    expect(arr).toMatchInlineSnapshot(`
      [
        3,
        {
          "a": 2,
          "b": {
            "c": 2,
            "d": 3,
          },
        },
        3,
      ]
    `)

    handler.undo()
    expect(handler.pointIndex).toBe(1)
    expect(arr).toMatchInlineSnapshot(`
      [
        1,
        {
          "a": 2,
          "b": {
            "c": 2,
          },
        },
        3,
      ]
    `)
    handler.undo()
    expect(handler.pointIndex).toBe(0)
    expect(arr).toStrictEqual(clone)

    handler.redo()
    handler.redo()
    expect(handler.pointIndex).toBe(2)
    expect(arr).toStrictEqual(o3)
  })
})
