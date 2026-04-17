import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.helpers.net.in',
  appName: 'Helpers Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
