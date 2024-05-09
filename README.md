# unrs

Control the changing state of an object.

```shell
npm install unrs
```

- `new Unrs(target)`
  - `path`  `<Object>` An object. 
  
- `instance.save()`
  - Save a record when data changes

- `instance.undo()`
  - Go back one record

- `instance.redo()`
  - Forward one record

- `instance.reset()`
  - Reset to the current saved state when data changes have not been saved

- `instance.patch(object)`
  - `path`  `<Object>` Modify the current data to the structure of 'object'. 

- `instance.pointIndex`
  - Pointer to the current record queue

- `instance.stackLength`
  - Current saved record length

### Example

```ts
import Unrs from 'unrs'
const data = {
  a: 1,
  children: [
    {
      a: 2,
    }
  ]
}
const handler = new Unrs(data)
data.b = 2
data.children.push({ a: 3, })
// data { a: 1, b: 2, children: [{ a: 2, }, { a: 3, }] }
// handler.pointIndex 0 handler.stackLength 0
handler.save()
handler.undo()
// data { a: 1, children: [ { a: 2, }, ], }
// handler.pointIndex 0 handler.stackLength 1
handler.redo()
// data { a: 1, b: 2, children: [{ a: 2, }, { a: 3, }] }
// handler.pointIndex 1 handler.stackLength 1
handler.undo()
// data { a: 1, children: [ { a: 2, }, ], }
// handler.pointIndex 0 handler.stackLength 1
data.d = 5
handler.reset()
// data { a: 1, children: [ { a: 2, }, ], }
// handler.pointIndex 0 handler.stackLength 1

//patch
handler.patch({ a: 1, b: 2, children: [{ c: 3 }] })
// data { a: 1, b: 2, children: [{ c: 3 }] }
// handler.pointIndex 0 handler.stackLength 1
handler.save()
// handler.pointIndex 1 handler.stackLength 1
handler.undo()
// data { a: 1, children: [ { a: 2, }, ], }
// handler.pointIndex 0 handler.stackLength 1
```

## License

[MIT](./LICENSE) License © 2024-PRESENT [muamuamu](https://github.com/muamuamu)