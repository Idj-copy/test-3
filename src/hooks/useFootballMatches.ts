import { useState, useEffect } from 'react';
import { SportEvent } from '../types/event';
import { fetchLigue1Matches } from '../services/footballApiService';

export function useFootballMatches() {
  const [matches, setMatches] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let intervalId: number;

    const loadMatches = async () => {
      if (!mounted) return;

      try {
        setLoading(true);
        
        const upcomingMatches = await fetchLigue1Matches();

        if (!mounted) return;

        // Sort matches by date
        const allMatches = [...upcomingMatches]
          .sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
        
        setMatches(allMatches);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load matches. Please try again later.');
        console.error('Error loading matches:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMatches();

    // Refresh matches every 5 minutes
    intervalId = window.setInterval(loadMatches, 5 * 60 * 1000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return { matches, loading, error };
}