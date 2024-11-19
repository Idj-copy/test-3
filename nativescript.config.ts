import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.sportifynow',
  appPath: 'app',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none'
  },
  ios: {
    discardUncaughtJsExceptions: true
  }
} as NativeScriptConfig;