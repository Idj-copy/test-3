/// <reference types="vite/client" />

interface Window {
  workbox: any;
}

interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  vibrate?: number[];
  sound?: string;
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  renotify?: boolean;
  silent?: boolean;
  timestamp?: number;
}

interface NotificationEvent extends Event {
  action: string;
  notification: Notification;
}

interface NotificationEventMap {
  click: NotificationEvent;
  close: NotificationEvent;
  error: NotificationEvent;
  show: NotificationEvent;
}

declare class Notification extends EventTarget {
  constructor(title: string, options?: NotificationOptions);
  static readonly permission: NotificationPermission;
  static requestPermission(): Promise<NotificationPermission>;
  static readonly maxActions: number;
  onclick: ((this: Notification, ev: NotificationEvent) => any) | null;
  onclose: ((this: Notification, ev: NotificationEvent) => any) | null;
  onerror: ((this: Notification, ev: NotificationEvent) => any) | null;
  onshow: ((this: Notification, ev: NotificationEvent) => any) | null;
  close(): void;
  addEventListener<K extends keyof NotificationEventMap>(
    type: K,
    listener: (this: Notification, ev: NotificationEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof NotificationEventMap>(
    type: K,
    listener: (this: Notification, ev: NotificationEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
}