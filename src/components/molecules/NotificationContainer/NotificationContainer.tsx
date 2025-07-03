import React from 'react';
import { useAppStore } from '../../../store/app.store';
import { Icon } from '../../atoms/Icon';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useAppStore();

  if (notifications.length === 0) return null;

  const getIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return <Icon name="check-circle" className="w-5 h-5 text-success-400 light:text-success-600" />;
      case 'error':
        return <Icon name="alert-circle" className="w-5 h-5 text-error-400 light:text-error-600" />;
      case 'info':
        return <Icon name="info" className="w-5 h-5 text-primary-400 light:text-primary-600" />;
    }
  };

  const getStyles = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-success-900/90 light:bg-success-50 border-success-500/30 light:border-success-200 text-success-300 light:text-success-800';
      case 'error':
        return 'bg-error-900/90 light:bg-error-50 border-error-500/30 light:border-error-200 text-error-300 light:text-error-800';
      case 'info':
        return 'bg-primary-900/90 light:bg-primary-50 border-primary-500/30 light:border-primary-200 text-primary-300 light:text-primary-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg border shadow-lg
            backdrop-blur-sm animate-slide-up
            ${getStyles(notification.type)}
          `}
        >
          {getIcon(notification.type)}
          <p className="flex-1 text-sm font-medium">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};