import { SportEvent } from '../types/event';
import { fetchLigue1Matches } from './footballApiService';
import { fetchF1Events } from './f1ApiService';
import { fetchUFCEvents } from './ufcApiService';
import { fetchBoxingEvents } from './boxingApiService';
import { getCustomEvents } from './customEventsService';

export const getEvents = async (): Promise<SportEvent[]> => {
  try {
    // Utiliser Promise.allSettled pour gérer les erreurs individuellement
    const [footballMatches, f1Events, ufcEvents, boxingEvents] = await Promise.allSettled([
      fetchLigue1Matches(),
      fetchF1Events(),
      fetchUFCEvents(),
      fetchBoxingEvents()
    ]);

    // Collecter les résultats réussis
    const results: SportEvent[] = [];
    
    if (footballMatches.status === 'fulfilled') results.push(...footballMatches.value);
    if (f1Events.status === 'fulfilled') results.push(...f1Events.value);
    if (ufcEvents.status === 'fulfilled') results.push(...ufcEvents.value);
    if (boxingEvents.status === 'fulfilled') results.push(...boxingEvents.value);

    // Récupérer les événements personnalisés
    const customEvents = getCustomEvents();

    // Filtrer les événements passés
    const now = new Date();
    const validEvents = [...customEvents, ...results].filter(event => {
      const eventStart = new Date(event.startTime);
      const twoHoursAfterStart = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);
      return twoHoursAfterStart > now;
    });

    // Trier par date
    return validEvents.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};