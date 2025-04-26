/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool4281197837",
    "name": "gameStarted",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // remove field
  collection.fields.removeById("bool4281197837")

  return app.save(collection)
})
