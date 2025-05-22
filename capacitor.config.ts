import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'no.yourdomain.evilinvaders',
  appName: 'Evil Invaders II',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always',
    webViewSuspensionOnBackground: false
  }
};

export default config;