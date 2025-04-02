import axios from 'axios';

// Tomorrow.io API configuration
const API_BASE_URL = 'https://api.tomorrow.io/v4';

// Use environment variables for API keys with rotation strategy
const API_KEYS = {
  current: import.meta.env.VITE_TOMORROW_API_KEY1,
  forecast: import.meta.env.VITE_TOMORROW_API_KEY2,
  historical: import.meta.env.VITE_TOMORROW_API_KEY3
};

// Fallback mechanism - if one key fails, try the next one
const API_KEY_FALLBACKS = {
  current: [import.meta.env.VITE_TOMORROW_API_KEY1, import.meta.env.VITE_TOMORROW_API_KEY2, import.meta.env.VITE_TOMORROW_API_KEY3],
  forecast: [import.meta.env.VITE_TOMORROW_API_KEY2, import.meta.env.VITE_TOMORROW_API_KEY3, import.meta.env.VITE_TOMORROW_API_KEY1],
  historical: [import.meta.env.VITE_TOMORROW_API_KEY3, import.meta.env.VITE_TOMORROW_API_KEY1, import.meta.env.VITE_TOMORROW_API_KEY2]
};

// API key status tracking
let apiKeyStatus = {
  current: { isValid: null, lastCheck: null, errorMessage: null, failCount: 0 },
  forecast: { isValid: null, lastCheck: null, errorMessage: null, failCount: 0 },
  historical: { isValid: null, lastCheck: null, errorMessage: null, failCount: 0 }
};

// API request counter
let apiRequestCount = {
  current: 0,
  forecast: 0,
  historical: 0,
  total: 0,
  lastReset: new Date().toISOString()
};

// Request throttling mechanism
let lastRequestTime = {
  current: 0,
  forecast: 0,
  historical: 0
};
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests of the same type

/**
 * Error types for better error handling
 */
const ErrorTypes = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  LOCATION_NOT_FOUND: 'LOCATION_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Custom error class for weather service errors
 */
class WeatherServiceError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = 'WeatherServiceError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Parse API error response to determine the specific error type
 * @param {Error} error - The error from axios
 * @returns {WeatherServiceError} - A typed error with additional context
 */
const parseApiError = (error, requestType) => {
  // Check if it's a network error
  if (!error.response) {
    return new WeatherServiceError(
      ErrorTypes.NETWORK_ERROR,
      'Network error: Unable to connect to weather service. Please check your internet connection.',
      error
    );
  }
  
  const status = error.response.status;
  const data = error.response.data;
  
  // Handle different error types based on status code and response
  switch (status) {
    case 401:
    case 403:
      if (requestType) {
        apiKeyStatus[requestType].isValid = false;
        apiKeyStatus[requestType].errorMessage = 'Invalid API key or unauthorized access';
        apiKeyStatus[requestType].failCount++;
      }
      return new WeatherServiceError(
        ErrorTypes.INVALID_API_KEY,
        'Invalid API key: Please check your Tomorrow.io API key.',
        error
      );
    
    case 404:
      return new WeatherServiceError(
        ErrorTypes.LOCATION_NOT_FOUND,
        'Location not found: Please check the city name and try again.',
        error
      );
    
    case 429:
      if (requestType) {
        apiKeyStatus[requestType].failCount++;
      }
      return new WeatherServiceError(
        ErrorTypes.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded: Too many requests. Trying alternative API key.',
        error
      );
    
    case 500:
    case 502:
    case 503:
    case 504:
      return new WeatherServiceError(
        ErrorTypes.SERVER_ERROR,
        'Server error: The weather service is currently unavailable. Please try again later.',
        error
      );
    
    default:
      // Try to extract message from response if available
      const message = data && data.message 
        ? `API Error: ${data.message}` 
        : 'Unknown error occurred while fetching weather data.';
      
      return new WeatherServiceError(
        ErrorTypes.UNKNOWN_ERROR,
        message,
        error
      );
  }
};

/**
 * Throttle API requests to avoid hitting rate limits
 * @param {string} requestType - Type of request (current, forecast, historical)
 * @returns {Promise} - Promise that resolves when it's safe to make a request
 */
const throttleRequest = async (requestType) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime[requestType];
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    // Calculate how long to wait
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Throttling ${requestType} API request. Waiting ${waitTime}ms...`);
    
    // Wait for the required time
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Update the last request time
  lastRequestTime[requestType] = Date.now();
};

/**
 * Get the appropriate API key for a request type, with fallback support
 * @param {string} requestType - Type of request (current, forecast, historical)
 * @param {number} attemptIndex - Index in the fallback array to try (default: 0)
 * @returns {string} - API key to use
 */
const getApiKey = (requestType, attemptIndex = 0) => {
  // If we've tried all keys, reset to the primary key
  if (attemptIndex >= API_KEY_FALLBACKS[requestType].length) {
    return API_KEYS[requestType];
  }
  
  return API_KEY_FALLBACKS[requestType][attemptIndex];
};

/**
 * Make an API request with automatic key rotation on failure
 * @param {string} requestType - Type of request (current, forecast, historical)
 * @param {string} endpoint - API endpoint to call
 * @param {Object} params - Request parameters (excluding apikey)
 * @param {number} attempt - Current attempt number (for recursion)
 * @returns {Promise<Object>} - Promise resolving to API response data
 */
const makeApiRequest = async (requestType, endpoint, params, attempt = 0) => {
  // Prevent infinite recursion
  if (attempt >= API_KEY_FALLBACKS[requestType].length) {
    throw new WeatherServiceError(
      ErrorTypes.RATE_LIMIT_EXCEEDED,
      'All API keys have been rate limited. Please try again later.',
      null
    );
  }
  
  // Throttle requests of the same type
  await throttleRequest(requestType);
  
  // Get the appropriate API key based on attempt number
  const apiKey = getApiKey(requestType, attempt);
  
  try {
    // Make the API request
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      params: {
        ...params,
        apikey: apiKey
      }
    });
    
    // Reset fail count on success
    apiKeyStatus[requestType].failCount = 0;
    apiKeyStatus[requestType].isValid = true;
    apiKeyStatus[requestType].lastCheck = new Date().toISOString();
    
    // Increment request counters
    apiRequestCount[requestType]++;
    apiRequestCount.total++;
    
    return response.data;
  } catch (error) {
    const parsedError = parseApiError(error, requestType);
    
    // If rate limited or invalid key, try the next key
    if (
      parsedError.type === ErrorTypes.RATE_LIMIT_EXCEEDED ||
      parsedError.type === ErrorTypes.INVALID_API_KEY
    ) {
      console.log(`API key issue with ${requestType} key ${attempt + 1}. Trying next key...`);
      return makeApiRequest(requestType, endpoint, params, attempt + 1);
    }
    
    // For other errors, just throw
    throw parsedError;
  }
};

// Weather code mapping
const WEATHER_CODES = {
  1000: "Clear",
  1001: "Cloudy",
  1100: "Mostly Clear",
  1101: "Partly Cloudy",
  1102: "Mostly Cloudy",
  2000: "Fog",
  2100: "Light Fog",
  4000: "Drizzle",
  4001: "Drizzle Rain",
  4200: "Light Rain",
  4201: "Heavy Rain",
  5000: "Snow",
  5001: "Light Thunder",
  8000: "Mostly Sunny"
};

// Reverse mapping for status to code
const STATUS_TO_CODE = {
  "Clear": 1000,
  "Cloudy": 1001,
  "Mostly Clear": 1100,
  "Partly Cloudy": 1101,
  "Mostly Cloudy": 1102,
  "Fog": 2000,
  "Light Fog": 2100,
  "Drizzle": 4000,
  "Drizzle Rain": 4001,
  "Light Rain": 4200,
  "Heavy Rain": 4201,
  "Snow": 5000,
  "Light Thunder": 5001,
  "Mostly Sunny": 8000
};

/**
 * Simple weather service for interacting with the Tomorrow.io API
 */
const simpleWeatherService = {
  // Error types exposed for consumers of this service
  ErrorTypes,
  
  /**
   * Get current weather conditions for a location by city name
   * @param {string} city - The city name
   * @returns {Promise} - Promise containing current weather data
   */
  getCurrentWeatherByCity: async (city) => {
    return makeApiRequest('current', '/weather/realtime', { location: city });
  },
  
  /**
   * Get weather forecast for a location by city name
   * @param {string} city - The city name
   * @returns {Promise} - Promise containing forecast data with hourly and daily objects
   */
  getForecastByCity: async (city) => {
    const data = await makeApiRequest('forecast', '/weather/forecast', { location: city });
    
    // Extract and format hourly forecast data (temperature and weatherCode only)
    const hourlyForecast = data.timelines.hourly.map(hour => ({
      time: hour.time,
      temperature: hour.values.temperature,
      weatherCode: hour.values.weatherCode
    }));
    
    // Extract and format daily forecast data (temperature and weatherCode only)
    const dailyForecast = data.timelines.daily.map(day => ({
      time: day.time,
      temperatureMax: day.values.temperatureMax,
      temperatureMin: day.values.temperatureMin,
      weatherCode: day.values.weatherCode
    }));
    
    return {
      location: data.location,
      hourly: hourlyForecast,
      daily: dailyForecast
    };
  },

  /**
   * Get historical weather data for a location by city name
   * @param {string} city - The city name
   * @param {number} days - Number of days to look back (default: 7)
   * @returns {Promise} - Promise containing historical weather data
   */
  getHistoricalWeatherByCity: async (city, days = 7) => {
    // Calculate the start and end dates for the historical data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Format dates as ISO strings (YYYY-MM-DD)
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const data = await makeApiRequest('historical', '/weather/history/recent', {
      location: city,
      startTime: startDateStr,
      endTime: endDateStr
    });
    
    // Extract and format hourly historical data
    const hourlyHistory = data.timelines.hourly.map(hour => ({
      time: hour.time,
      temperature: hour.values.temperature,
      humidity: hour.values.humidity,
      windSpeed: hour.values.windSpeed,
      precipitation: hour.values.precipitationIntensity,
      weatherCode: hour.values.weatherCode
    }));
    
    // Extract and format daily historical data
    const dailyHistory = data.timelines.daily.map(day => ({
      time: day.time,
      temperatureAvg: day.values.temperatureAvg,
      temperatureMax: day.values.temperatureMax,
      temperatureMin: day.values.temperatureMin,
      humidityAvg: day.values.humidityAvg,
      windSpeedAvg: day.values.windSpeedAvg,
      precipitationSum: day.values.precipitationSum
    }));
    
    return {
      location: data.location,
      hourly: hourlyHistory,
      daily: dailyHistory
    };
  },

  /**
   * Get weather status text from weather code
   * @param {number} code - The weather code from the API
   * @returns {string} - Human-readable weather status
   */
  getWeatherStatus: (code) => {
    return WEATHER_CODES[code] || "Unknown";
  },

  /**
   * Get weather code from status text
   * @param {string} status - The weather status text
   * @returns {number} - The corresponding weather code
   */
  getWeatherCode: (status) => {
    return STATUS_TO_CODE[status] || 1000; // Default to Clear if not found
  },
  
  /**
   * Get the current API request count statistics
   * @returns {Object} - Object containing API request counts
   */
  getApiRequestCount: () => {
    return {
      ...apiRequestCount,
      lastChecked: new Date().toISOString()
    };
  },
  
  /**
   * Reset the API request counter
   */
  resetApiRequestCount: () => {
    apiRequestCount = {
      current: 0,
      forecast: 0,
      historical: 0,
      total: 0,
      lastReset: new Date().toISOString()
    };
    return apiRequestCount;
  },
  
  /**
   * Get the current throttling settings
   */
  getThrottleSettings: () => {
    return {
      minRequestInterval: MIN_REQUEST_INTERVAL,
      lastRequestTime
    };
  },
  
  /**
   * Get the API key status for all keys
   */
  getApiKeyStatus: () => {
    return { ...apiKeyStatus };
  },
  
  /**
   * Get information about which API keys are being used for which request types
   */
  getApiKeyAssignments: () => {
    return {
      current: API_KEYS.current,
      forecast: API_KEYS.forecast,
      historical: API_KEYS.historical,
      fallbackStrategy: 'Rotating through all keys on rate limit or key failure'
    };
  }
};

export default simpleWeatherService;
