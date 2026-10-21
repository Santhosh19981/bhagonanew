import { environment } from '../environments/environment';

export function resolveApiUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = (window.location.hostname || '').toLowerCase();

    // 1. Production domain -> Production Database
    if (hostname === 'bhagona.in' || hostname === 'www.bhagona.in') {
      return 'https://api.bhagona.in';
    }

    // 2. Localhost or QA environment -> QA Database
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('qa') ||
      hostname.endsWith('.local')
    ) {
      return 'https://qa-api.bhagona.in';
    }
  }

  // 3. Fallback based on build configuration
  if (environment.production) {
    return environment.apiUrl || 'https://api.bhagona.in';
  }

  return environment.apiUrl || 'https://qa-api.bhagona.in';
}

export const config = {
  get apiUrl(): string {
    return resolveApiUrl();
  },
  production: environment.production,
  qa: environment.qa
};

