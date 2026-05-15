import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandlerClerk,
} from '@clerk/mcp-tools/next';

const handler = protectedResourceHandlerClerk({
  scopes_supported: [
    'profile',
    'email',
    'offline_access',
    'openid',
    'public_metadata',
    'private_metadata',
  ],
});
const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
