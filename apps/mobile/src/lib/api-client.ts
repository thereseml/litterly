export type LitterInput = {
  species: 'cat' | 'dog'; name: string; born_on: string; count: number;
  mother_name: string | null; father_name: string | null; notes: string | null;
};
export type Litter = LitterInput & { id: string; owner_id: string; created_at: string };
export type PetSex = 'male' | 'female';
export type PetInput = { name: string; sex: PetSex; notes: string | null };
export type Pet = PetInput & { id: string; litter_id: string; created_at: string; updated_at: string };
export type WeightMeasurementInput = { pet_id: string; weight_grams: number };
export type WeightMeasurement = WeightMeasurementInput & { id: string; measured_on: string; created_at: string };
export type BreederProfile = { kennel_name: string | null };
export type BreederProfileInput = { kennel_name: string | null };

export class ApiError extends Error {
  constructor(public code: string, public status?: number) { super(code); }
}

type ApiClientOptions = {
  baseUrl?: string;
  getAccessToken: () => Promise<string | null>;
  fetcher?: typeof fetch;
};

export function createApiClient(options: ApiClientOptions) {
  const fetcher = options.fetcher ?? fetch;

  return async function request<T>(path: string, body?: object, method?: 'POST' | 'PATCH'): Promise<T> {
    const accessToken = await options.getAccessToken();
    if (!accessToken) throw new ApiError('UNAUTHORIZED', 401);
    if (!options.baseUrl) throw new ApiError('INTERNAL_ERROR', 500);
    let response: Response;
    try {
      response = await fetcher(`${options.baseUrl}${path}`, {
        method: method ?? (body ? 'POST' : 'GET'),
        headers: { Authorization: `Bearer ${accessToken}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(15000),
      });
    } catch { throw new ApiError('network'); }
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(result?.error?.code ?? 'generic', response.status);
    return result as T;
  };
}

export function errorKey(error: unknown): string {
  if (error instanceof ApiError) {
    const known = ['UNAUTHORIZED', 'NOT_FOUND', 'VALIDATION_ERROR', 'INTERNAL_ERROR', 'RATE_LIMITED', 'network'];
    if (known.includes(error.code)) return `errors.${error.code}`;
    if (error.status === 400) return 'errors.VALIDATION_ERROR';
    if (error.status === 401 || error.status === 403) return 'errors.UNAUTHORIZED';
    if (error.status === 404) return 'errors.NOT_FOUND';
    if (error.status === 429) return 'errors.RATE_LIMITED';
    if (error.status !== undefined && error.status >= 500) return 'errors.INTERNAL_ERROR';
    return 'errors.generic';
  }
  const code = (error as { code?: string })?.code;
  if (code === 'invalid_credentials') return 'errors.credentials';
  if (code === 'otp_expired' || code === 'invalid_otp') return 'errors.invalidCode';
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') return 'errors.rateLimit';
  if ((error as { name?: string })?.name === 'AuthRetryableFetchError') return 'errors.network';
  return 'errors.generic';
}
