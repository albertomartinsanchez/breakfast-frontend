import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.breakfast.orders',
  appName: 'Breakfast Orders',
  webDir: 'dist',
  server: {
    url: 'https://sample-api-frontend.onrender.com/app',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
