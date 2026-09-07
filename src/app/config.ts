import { environment } from '../environments/environment';

export const config = {
  apiUrl: environment.apiUrl,
  production: environment.production,
  qa: environment.qa
};

