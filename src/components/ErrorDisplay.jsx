import React from 'react';
import './ErrorDisplay.css';
import simpleWeatherService from '../services/simpleWeatherService';

const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
  // Default values if error is not properly structured
  const errorType = error?.type || 'UNKNOWN_ERROR';
  const errorMessage = error?.message || 'An unknown error occurred';
  
  // Determine icon and color based on error type
  let icon = '⚠️';
  let actionText = '';
  
  switch (errorType) {
    case simpleWeatherService.ErrorTypes.INVALID_API_KEY:
      icon = '🔑';
      actionText = 'Please check your API key in the .env file and restart the application.';
      break;
    case simpleWeatherService.ErrorTypes.RATE_LIMIT_EXCEEDED:
      icon = '⏱️';
      actionText = 'Please wait a moment before trying again.';
      break;
    case simpleWeatherService.ErrorTypes.LOCATION_NOT_FOUND:
      icon = '🗺️';
      actionText = 'Please check the city name and try again.';
      break;
    case simpleWeatherService.ErrorTypes.NETWORK_ERROR:
      icon = '📶';
      actionText = 'Please check your internet connection and try again.';
      break;
    case simpleWeatherService.ErrorTypes.SERVER_ERROR:
      icon = '🖥️';
      actionText = 'The weather service is currently unavailable. Please try again later.';
      break;
    default:
      icon = '❓';
      actionText = 'Please try again or contact support if the issue persists.';
  }
  
  return (
    <div className="error-container">
      <div className="error-icon">{icon}</div>
      <div className="error-content">
        <h3 className="error-title">{getErrorTitle(errorType)}</h3>
        <p className="error-message">{errorMessage}</p>
        <p className="error-action">{actionText}</p>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            Try Again
          </button>
        )}
        {onDismiss && (
          <button className="error-dismiss-btn" onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

// Helper function to get a user-friendly error title
const getErrorTitle = (errorType) => {
  switch (errorType) {
    case simpleWeatherService.ErrorTypes.INVALID_API_KEY:
      return 'API Key Error';
    case simpleWeatherService.ErrorTypes.RATE_LIMIT_EXCEEDED:
      return 'Rate Limit Exceeded';
    case simpleWeatherService.ErrorTypes.LOCATION_NOT_FOUND:
      return 'Location Not Found';
    case simpleWeatherService.ErrorTypes.NETWORK_ERROR:
      return 'Network Error';
    case simpleWeatherService.ErrorTypes.SERVER_ERROR:
      return 'Server Error';
    default:
      return 'Error';
  }
};

export default ErrorDisplay;
