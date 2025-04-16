/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_");

  // ensure OAuth providers are enabled
  collection.options = {
    ...collection.options,
    allowOAuth2Auth: true,
    allowUsernameAuth: true,
    allowEmailAuth: true,
    requireEmail: true
  };

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_");
  
  // revert to previous state
  delete collection.options.allowOAuth2Auth;
  
  return app.save(collection);
}); 