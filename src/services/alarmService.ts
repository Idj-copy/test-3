interface AlarmOptions {
  title: string;
  date: Date;
}

export const setAlarm = async ({ title, date }: AlarmOptions): Promise<void> => {
  try {
    // Vérifier si la date est valide et future
    const now = new Date();
    if (date.getTime() <= now.getTime()) {
      throw new Error('La date de l\'alarme doit être dans le futur');
    }

    // Créer l'URL pour l'alarme
    const alarmUrl = new URL('https://');
    alarmUrl.protocol = 'android-app:';
    alarmUrl.host = 'com.android.deskclock';
    alarmUrl.pathname = '/alarm/new';
    alarmUrl.searchParams.append('hour', date.getHours().toString());
    alarmUrl.searchParams.append('minutes', date.getMinutes().toString());
    alarmUrl.searchParams.append('message', title);
    alarmUrl.searchParams.append('vibrate', 'true');
    alarmUrl.searchParams.append('skipUi', 'true');

    // Détecter la plateforme
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isAndroid) {
      // Créer un lien et le cliquer pour Android
      const link = document.createElement('a');
      link.href = alarmUrl.toString();
      link.click();
    } else if (isIOS) {
      // Afficher un message spécifique pour iOS
      alert(`Pour définir une alarme pour "${title}" à ${date.toLocaleTimeString()}, veuillez utiliser l'application Horloge de votre iPhone.`);
    } else {
      // Message générique pour les autres plateformes
      const formattedDate = date.toLocaleString();
      alert(`Pour définir une alarme pour "${title}" à ${formattedDate}, veuillez utiliser l'application d'alarme de votre appareil.`);
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'alarme:', error);
    throw new Error('Impossible de créer l\'alarme. Veuillez utiliser l\'application d\'alarme de votre appareil.');
  }
};