import React from 'react';
import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ 
  error, 
  type = 'error', 
  className = '',
  onDismiss,
  showIcon = true 
}) => {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message || '发生未知错误';

  const typeStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: ExclamationTriangleIcon
  };

  const Icon = icons[type];

  return (
    <div className={`border rounded-md p-4 ${typeStyles[type]} ${className}`}>
      <div className="flex items-start">
        {showIcon && (
          <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;