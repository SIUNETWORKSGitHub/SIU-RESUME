// docs/main.js
import { UserManager } from "https://esm.sh/oidc-client-ts@2.2.4";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_C6pp0v70h",
  client_id: "2atbpmss0eh84md5mlqj1jgch7",
  redirect_uri: "https://siucloud.org/", // Ensure this matches AWS exactly
  response_type: "code",
  scope: "phone openid email"
};

export const userManager = new UserManager(cognitoAuthConfig);

export async function signOutRedirect() {
  const clientId = "2atbpmss0eh84md5mlqj1jgch7";
  const logoutUri = "https://siucloud.org/";
  
  // TO DO: Go to Cognito Console -> App Integration and copy your "Domain"
  // It looks like: https://something.auth.us-east-2.amazoncognito.com
  const cognitoDomain = "https://us-east-2c6pp0v70h.auth.us-east-2.amazoncognito.com";
  
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
