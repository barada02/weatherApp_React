import axios from 'axios';

// Tomorrow.io API configuration
const API_BASE_URL = 'https://api.tomorrow.io/v4';

// Use environment variables for API key
const API_KEY = import.meta.env.VITE_TOMORROW_API_KEY;
const API_UNITS = import.meta.env.VITE_API_UNITS || 'metric';

/**
 * Weather service for interacting with the Tomorrow.io API
 */
const weatherService = {
  /**
   * Get current weather conditions for a location
   * @param {number} latitude - The latitude coordinate
   * @param {number} longitude - The longitude coordinate
   * @returns {Promise} - Promise containing current weather data
   */
  getCurrentWeather: async (latitude, longitude) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather/realtime`, {
        params: {
          location: `${latitude},${longitude}`,
          apikey: API_KEY,
          units: API_UNITS
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  },

  /**
   * Get hourly forecast for a location
   * @param {number} latitude - The latitude coordinate
   * @param {number} longitude - The longitude coordinate
   * @param {number} hours - Number of hours to forecast (default: 24)
   * @returns {Promise} - Promise containing hourly forecast data
   */
  getHourlyForecast: async (latitude, longitude, hours = 24) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather/forecast`, {
        params: {
          location: `${latitude},${longitude}`,
          apikey: API_KEY,
          units: API_UNITS,
          timesteps: '1h',
          startTime: 'now',
          endTime: `nowPlus${hours}h`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hourly forecast:', error);
      throw error;
    }
  },

  /**
   * Get daily forecast for a location
   * @param {number} latitude - The latitude coordinate
   * @param {number} longitude - The longitude coordinate
   * @param {number} days - Number of days to forecast (default: 7)
   * @returns {Promise} - Promise containing daily forecast data
   */
  getDailyForecast: async (latitude, longitude, days = 7) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather/forecast`, {
        params: {
          location: `${latitude},${longitude}`,
          apikey: API_KEY,
          units: API_UNITS,
          timesteps: '1d',
          startTime: 'now',
          endTime: `nowPlus${days}d`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily forecast:', error);
      throw error;
    }
  },

  /**
   * Search for a location by name
   * @param {string} query - The location name to search for
   * @returns {Promise} - Promise containing location data
   */
  searchLocation: async (query) => {
    try {
      // Tomorrow.io doesn't have a direct location search API
      // This is a placeholder - you might need to use a different API for geocoding
      // such as OpenCage, Google Places, or MapBox
      console.warn('Location search not implemented with Tomorrow.io API');
      return null;
    } catch (error) {
      console.error('Error searching location:', error);
      throw error;
    }
  }
};

export default weatherService;
