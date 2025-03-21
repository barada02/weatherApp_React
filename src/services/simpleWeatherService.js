import axios from 'axios';

// Tomorrow.io API configuration
const API_BASE_URL = 'https://api.tomorrow.io/v4';

// Use environment variables for API key
const API_KEY = import.meta.env.VITE_TOMORROW_API_KEY;

/**
 * Simple weather service for interacting with the Tomorrow.io API
 */
const simpleWeatherService = {
  /**
   * Get current weather conditions for a location by city name
   * @param {string} city - The city name
   * @returns {Promise} - Promise containing current weather data
   */
  getCurrentWeatherByCity: async (city) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather/realtime`, {
        params: {
          location: city,
          apikey: API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather by city:', error);
      throw error;
    }
  },
  
  /**
   * Get weather forecast for a location by city name
   * @param {string} city - The city name
   * @returns {Promise} - Promise containing forecast data with hourly and daily objects
   */
  getForecastByCity: async (city) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather/forecast`, {
        params: {
          location: city,
          apikey: API_KEY
        }
      });
      
      // Extract and format hourly forecast data (temperature and weatherCode only)
      const hourlyForecast = response.data.timelines.hourly.map(hour => ({
        time: hour.time,
        temperature: hour.values.temperature,
        weatherCode: hour.values.weatherCode
      }));
      
      // Extract and format daily forecast data (temperature and weatherCode only)
      const dailyForecast = response.data.timelines.daily.map(day => ({
        time: day.time,
        temperatureMax: day.values.temperatureMax,
        temperatureMin: day.values.temperatureMin,
        weatherCode: day.values.weatherCode
      }));
      
      return {
        location: response.data.location,
        hourly: hourlyForecast,
        daily: dailyForecast
      };
    } catch (error) {
      console.error('Error fetching forecast by city:', error);
      throw error;
    }
  }
};

export default simpleWeatherService;
