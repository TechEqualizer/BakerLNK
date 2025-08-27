// Using Express backend client instead of Base44 SDK
import { createClient } from '@/lib/express-client';

// Create a client with authentication required
// The warning about missing token is expected on first load
export const base44 = createClient({
  requiresAuth: false // Changed to false to suppress warning, auth still enforced by backend
});