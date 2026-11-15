import { createApiClient } from './api-client';
import { apiUrl, supabase } from './supabase';

export { ApiError, errorKey } from './api-client';
export type { Litter, LitterInput } from './api-client';

export const api = createApiClient({
  baseUrl: apiUrl,
  getAccessToken: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session?.access_token ?? null;
  },
});
