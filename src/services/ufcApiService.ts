import { SportEvent } from '../types/event';
import { fetchWithRetry, hasData, isValidDate, sanitizeUrl } from './apiService';

const UFC_LEAGUE = {
  name: 'UFC',
  logo: 'https://www.thesportsdb.com/images/media/league/badge/bewnz31717531281.png'
};

const BROADCASTERS = {
  UFC_FIGHT_PASS: {
    name: 'UFC Fight Pass',
    logo: 'https://www.thesportsdb.com/images/media/channel/logo/UFC_Fight_Pass.png'
  },
  ESPN_PLUS: {
    name: 'ESPN+',
    logo: 'https://www.thesportsdb.com/images/media/channel/logo/ESPN_Plus.png'
  }
};

interface UFCEventResponse {
  idEvent: string;
  strEvent: string;
  dateEvent: string;
  strTime: string;
  strVenue?: string;
  strTVStation?: string;
}

export const fetchUFCEvents = async (): Promise<SportEvent[]> => {
  try {
    const data = await fetchWithRetry<{ events: UFCEventResponse[] }>('/eventsnextleague.php?id=4463');

    if (!hasData<UFCEventResponse>(data)) {
      console.log('Aucun événement UFC trouvé');
      return [];
    }

    return data.events
      .filter(event => {
        if (!event?.dateEvent || !event?.strTime || !event?.strEvent) return false;
        if (!isValidDate(`${event.dateEvent}T${event.strTime}`)) return false;
        
        const now = new Date();
        const eventDate = new Date(`${event.dateEvent}T${event.strTime}`);
        return eventDate > now;
      })
      .map(event => {
        try {
          const startTime = new Date(`${event.dateEvent}T${event.strTime}`);
          startTime.setHours(startTime.getHours() + 1);

          const fighters = event.strEvent.split(' vs ').map(name => name.trim());
          const [fighter1 = '', fighter2 = ''] = fighters;

          let broadcaster = BROADCASTERS.UFC_FIGHT_PASS;
          if (event.strTVStation?.toLowerCase().includes('espn')) {
            broadcaster = BROADCASTERS.ESPN_PLUS;
          }

          const getImageUrl = (name: string) => {
            const formattedName = name.toLowerCase()
              .replace(/[^a-z0-9]/g, '')
              .substring(0, 20);
            return sanitizeUrl(`https://www.thesportsdb.com/images/media/player/thumb/${formattedName}.jpg`);
          };

          return {
            id: event.idEvent,
            title: event.strEvent,
            sportType: 'MMA',
            startTime: startTime.toISOString(),
            endTime: new Date(startTime.getTime() + 3 * 60 * 60 * 1000).toISOString(),
            league: UFC_LEAGUE,
            teams: {
              home: fighter1,
              home_logo: getImageUrl(fighter1),
              away: fighter2,
              away_logo: getImageUrl(fighter2)
            },
            venue: event.strVenue || 'À déterminer',
            status: 'upcoming',
            broadcastChannel: broadcaster.name,
            broadcastLogo: broadcaster.logo
          } as SportEvent;
        } catch (error) {
          console.error('Erreur lors du traitement d\'un événement UFC:', error);
          return null;
        }
      })
      .filter((event): event is SportEvent => event !== null)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  } catch (error) {
    console.error('Erreur lors de la récupération des événements UFC:', error);
    throw error;
  }
};