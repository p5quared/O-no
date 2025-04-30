/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool2729054226",
    "name": "is_started",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // remove field
  collection.fields.removeById("bool2729054226")

  return app.save(collection)
})
