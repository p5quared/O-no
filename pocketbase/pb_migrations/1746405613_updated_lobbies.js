/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool494810431",
    "name": "is_ended",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // remove field
  collection.fields.removeById("bool494810431")

  return app.save(collection)
})
