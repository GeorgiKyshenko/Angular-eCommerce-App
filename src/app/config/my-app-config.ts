export default {
  oidc: {
    clientId: '0oacu0n5kbHwDWBFz5d7',
    issuer: 'https://dev-72744065.okta.com/oauth2/default',
    redirectUri: 'http://localhost:4200/login/callback', //the URL used to redirect after succesfull authentication on login
    scopes: ['openid', 'profile', 'email'],
  },
};
