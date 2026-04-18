// docs/main.js
import { UserManager } from "https://esm.sh/oidc-client-ts@2.2.4";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_C6pp0v70h",
  client_id: "2atbpmss0eh84md5mlqj1jgch7",
  redirect_uri: "https://siucloud.org", // FIXED: Removed the / at the end
  response_type: "token id_token",       // FIXED: Changed 'code' to 'token id_token' to match AWS Implicit Grant
  scope: "phone openid email",
  loadUserInfo: true
};

export const userManager = new UserManager(cognitoAuthConfig);

export async function signOutRedirect() {
  const clientId = "2atbpmss0eh84md5mlqj1jgch7";
  const logoutUri = "https://siucloud.org"; // FIXED: Removed the / at the end
  
  const cognitoDomain = "https://us-east-2c6pp0v70h.auth.us-east-2.amazoncognito.com";
  
  // Clear local session before redirecting
  await userManager.removeUser();
  
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
