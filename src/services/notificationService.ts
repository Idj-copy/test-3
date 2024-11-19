import { SportEvent } from '../types/event';

const NOTIFICATIONS_KEY = 'sportify_notifications';

interface NotificationData {
  id: string;
  eventId: string;
  title: string;
  message: string;
  scheduledFor: string;
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Ce navigateur ne prend pas en charge les notifications');
    return 'denied';
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return 'denied';
  }
};

export const scheduleNotification = async (event: SportEvent, notificationDate: Date): Promise<void> => {
  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Permission de notification non accordée');
    }

    const notifications = getScheduledNotifications();
    const notificationId = `notification-${Date.now()}`;

    const newNotification: NotificationData = {
      id: notificationId,
      eventId: event.id,
      title: 'Rappel Événement',
      message: `${event.title} commence ${getTimeMessage(notificationDate)}`,
      scheduledFor: notificationDate.toISOString()
    };

    notifications.push(newNotification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

    const timeUntilNotification = notificationDate.getTime() - Date.now();
    if (timeUntilNotification > 0) {
      setTimeout(() => {
        showNotification(newNotification).catch(console.error);
        removeScheduledNotification(notificationId);
      }, timeUntilNotification);
    }
  } catch (error) {
    console.error('Erreur lors de la planification de la notification:', error);
    throw error;
  }
};

const showNotification = async (notification: NotificationData): Promise<void> => {
  if (Notification.permission === 'granted') {
    try {
      await new Notification(notification.title, {
        body: notification.message,
        icon: '/pwa-192x192.png',
        tag: notification.id,
        requireInteraction: true
      });
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la notification:', error);
      throw error;
    }
  }
};

export const getScheduledNotifications = (): NotificationData[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) return [];

    const notifications = JSON.parse(stored) as NotificationData[];
    
    // Nettoyer les notifications expirées
    const now = Date.now();
    const validNotifications = notifications.filter(notification => 
      new Date(notification.scheduledFor).getTime() > now
    );

    if (validNotifications.length !== notifications.length) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(validNotifications));
    }

    return validNotifications;
  } catch (error) {
    console.error('Erreur lors de la lecture des notifications:', error);
    return [];
  }
};

const removeScheduledNotification = (notificationId: string): void => {
  try {
    const notifications = getScheduledNotifications();
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
  }
};

const getTimeMessage = (notificationDate: Date): string => {
  const now = new Date();
  const diffMinutes = Math.round((notificationDate.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffMinutes >= 24 * 60) {
    return 'demain';
  } else if (diffMinutes >= 60) {
    return `dans ${Math.round(diffMinutes / 60)} heures`;
  } else {
    return `dans ${diffMinutes} minutes`;
  }
};