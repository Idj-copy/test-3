import { type FC } from 'react';
import { Button } from './ui/button';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 text-center">
      <p className="text-red-400 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Réessayer
        </Button>
      )}
    </div>
  );
};

export default ErrorDisplay;