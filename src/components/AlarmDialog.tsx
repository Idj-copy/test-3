import React, { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SportEvent } from '../types/event';
import { setAlarm } from '../services/alarmService';

interface AlarmDialogProps {
  event: SportEvent;
  open: boolean;
  onClose: () => void;
}

const AlarmDialog: FC<AlarmDialogProps> = ({ event, open, onClose }) => {
  const handleSetAlarm = async (minutes: number) => {
    try {
      const eventDate = new Date(event.startTime);
      const alarmDate = new Date(eventDate.getTime() - minutes * 60 * 1000);
      
      await setAlarm({
        title: event.title,
        date: alarmDate
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'alarme:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la configuration de l\'alarme');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Définir une alarme pour {event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-400">
            Quand souhaitez-vous que l'alarme sonne ?
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleSetAlarm(24 * 60)}
              className="justify-start"
            >
              1 jour avant
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSetAlarm(60)}
              className="justify-start"
            >
              1 heure avant
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSetAlarm(15)}
              className="justify-start"
            >
              15 minutes avant
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlarmDialog;