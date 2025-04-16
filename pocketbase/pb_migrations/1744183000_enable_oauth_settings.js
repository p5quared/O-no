/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Update user collection auth options
  const users = app.findCollectionByNameOrId("_pb_users_auth_");
  users.options = {
    ...users.options,
    allowOAuth2Auth: true,
    allowEmailAuth: true,
    allowUsernameAuth: true,
    requireEmail: true
  };
  
  // Configure Google OAuth provider
  app.settings.googleAuth = {
    enabled: true,
    clientId: "PUBLIC_GOOGLE_CLIENT_ID", // Replace with your actual client ID in environment variables
    clientSecret: "GOOGLE_CLIENT_SECRET", // Replace with your actual client secret in environment variables
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userApiUrl: "https://www.googleapis.com/oauth2/v1/userinfo"
  };

  return app.save(users);
}, (app) => {
  // Revert changes
  const users = app.findCollectionByNameOrId("_pb_users_auth_");
  
  // Remove OAuth settings if needed
  if (users.options) {
    delete users.options.allowOAuth2Auth;
  }
  
  // Disable Google OAuth
  if (app.settings.googleAuth) {
    app.settings.googleAuth.enabled = false;
  }
  
  return app.save(users);
}); 