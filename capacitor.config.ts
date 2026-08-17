import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bhagona.app',
  appName: 'Bhagona',
  webDir: 'dist/bhagonanew/browser',
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
