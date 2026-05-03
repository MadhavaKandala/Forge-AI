import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hundreddays.app',
  appName: '100 Days Challenge',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '275760652639-4flj5gar1op7tfsr5gkkcd13t8t4t2im.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
