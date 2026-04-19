// docs/main.js
import { UserManager } from "https://esm.sh/oidc-client-ts@2.2.4";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_C6pp0v70h",
  client_id: "2atbpmss0eh84md5mlqj1jgch7",
  redirect_uri: "https://siucloud.org",
  response_type: "token id_token",
  scope: "phone openid email",
  loadUserInfo: true,
  // --- THE FIX: MANUAL METADATA ---
  // We hardcode these so the button doesn't have to "wait" or "ask" AWS
  metadata: {
    issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_C6pp0v70h",
    authorization_endpoint: "https://us-east-2c6pp0v70h.auth.us-east-2.amazoncognito.com/oauth2/authorize",
    userinfo_endpoint: "https://us-east-2c6pp0v70h.auth.us-east-2.amazoncognito.com/oauth2/userInfo",
    jwks_uri: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_C6pp0v70h/.well-known/jwks.json",
    end_session_endpoint: "https://us-east-2c6pp0v70h.auth.us-east-2.amazoncognito.com/logout"
  }
};

export const userManager = new UserManager(cognitoAuthConfig);

export async function signOutRedirect() {
  const clientId = "2atbpmss0eh84md5mlqj1jgch7";
  const logoutUri = "https://siucloud.org";
  const cognitoDomain = "https://us-east-2c6pp0v70h.auth.us-east-2.amazoncognito.com";
  
  await userManager.removeUser();
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
