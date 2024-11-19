import { F1Event } from '../types/event';
import { fetchWithRetry, formatApiError } from './apiService';

const F1_BROADCASTER = {
  name: 'CANAL+',
  logo: 'https://www.thesportsdb.com/images/media/channel/logo/rswyxx1436720242.png'
};

const CURRENT_SEASON = new Date().getFullYear();

interface F1ApiResponse {
  events?: Array<{
    idEvent: string;
    dateEvent: string;
    strTime: string;
    strEvent: string;
    strVenue?: string;
  }>;
}

export const fetchF1Events = async (): Promise<F1Event[]> => {
  try {
    let data = await fetchWithRetry<F1ApiResponse>(`/eventsseason.php?id=4370&s=${CURRENT_SEASON}`);
    
    if (!data?.events?.length) {
      data = await fetchWithRetry<F1ApiResponse>(`/eventsseason.php?id=4370&s=${CURRENT_SEASON + 1}`);
    }

    if (!data?.events?.length) {
      console.log('Aucun événement F1 trouvé');
      return [];
    }

    const now = new Date();
    return data.events
      .filter((event) => {
        if (!event?.dateEvent || !event?.strTime || !event?.strEvent) return false;
        if (event.strEvent.toLowerCase().includes('practice')) return false;
        
        const eventDate = new Date(event.dateEvent + 'T' + event.strTime);
        return eventDate > now;
      })
      .map((event): F1Event | null => {
        try {
          const startTime = new Date(event.dateEvent + 'T' + event.strTime);
          startTime.setHours(startTime.getHours() + 1);

          const eventName = event.strEvent.toLowerCase();
          const location = event.strEvent.split(/sprint|qualifying|grand prix/i)[0].trim();

          const isSprintShootout = eventName.includes('sprint shootout');
          const isSprintRace = eventName.includes('sprint') && !isSprintShootout;
          const isMainQualifying = eventName.includes('qualifying') && !eventName.includes('sprint');
          const isMainRace = eventName.includes('grand prix');

          let sessionType: F1Event['sessionType'];
          let title: string;

          if (isSprintShootout) {
            sessionType = 'sprint_shootout';
            title = `Qualification Sprint`;
          } else if (isSprintRace) {
            sessionType = 'sprint_race';
            title = `Course Sprint`;
          } else if (isMainQualifying) {
            sessionType = 'qualifying';
            title = `Qualification`;
          } else if (isMainRace) {
            sessionType = 'race';
            title = `Course`;
          } else {
            return null;
          }

          const duration = isMainRace ? 2 : 1;

          return {
            id: event.idEvent,
            title,
            location,
            sessionType,
            sportType: 'Formula 1',
            startTime: startTime.toISOString(),
            endTime: new Date(startTime.getTime() + duration * 60 * 60 * 1000).toISOString(),
            league: {
              name: 'Formula 1',
              logo: 'https://www.thesportsdb.com/images/media/league/badge/g8cofl1513623681.png'
            },
            venue: event.strVenue || 'À déterminer',
            status: 'upcoming',
            broadcastChannel: F1_BROADCASTER.name,
            broadcastLogo: F1_BROADCASTER.logo
          };
        } catch (error) {
          console.error('Erreur lors du traitement d\'un événement F1:', error);
          return null;
        }
      })
      .filter((event): event is F1Event => event !== null)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  } catch (error) {
    console.error('Erreur lors de la récupération des événements F1:', formatApiError(error));
    throw error;
  }
};