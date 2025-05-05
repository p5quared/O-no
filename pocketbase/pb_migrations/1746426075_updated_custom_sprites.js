/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_742289565")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "file3675000970",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [
      "image/png",
      "image/jpeg"
    ],
    "name": "sprite_image",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [
      "50x50"
    ],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_742289565")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "file3675000970",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [
      "image/png",
      "image/jpeg"
    ],
    "name": "sprite_image",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
