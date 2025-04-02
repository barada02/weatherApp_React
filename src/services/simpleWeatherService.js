import axios from 'axios';

// Tomorrow.io API configuration
const API_BASE_URL = 'https://api.tomorrow.io/v4';

// Use environment variables for API key
const API_KEY = import.meta.env.VITE_TOMORROW_API_KEY2;

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
  },

  /**
   * Get historical weather data for a location by city name
   * @param {string} city - The city name
   * @param {number} days - Number of days to look back (default: 7)
   * @returns {Promise} - Promise containing historical weather data
   */
  getHistoricalWeatherByCity: async (city, days = 7) => {
    try {
      // Calculate the start and end dates for the historical data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      // Format dates as ISO strings (YYYY-MM-DD)
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await axios.get(`${API_BASE_URL}/weather/history/recent`, {
        params: {
          location: city,
          startTime: startDateStr,
          endTime: endDateStr,
          apikey: API_KEY
        }
      });
      
      // Extract and format hourly historical data
      const hourlyHistory = response.data.timelines.hourly.map(hour => ({
        time: hour.time,
        temperature: hour.values.temperature,
        humidity: hour.values.humidity,
        windSpeed: hour.values.windSpeed,
        precipitation: hour.values.precipitationIntensity,
        weatherCode: hour.values.weatherCode
      }));
      
      // Extract and format daily historical data
      const dailyHistory = response.data.timelines.daily.map(day => ({
        time: day.time,
        temperatureAvg: day.values.temperatureAvg,
        temperatureMax: day.values.temperatureMax,
        temperatureMin: day.values.temperatureMin,
        humidityAvg: day.values.humidityAvg,
        windSpeedAvg: day.values.windSpeedAvg,
        precipitationSum: day.values.precipitationSum
      }));
      
      return {
        location: response.data.location,
        hourly: hourlyHistory,
        daily: dailyHistory
      };
    } catch (error) {
      console.error('Error fetching historical weather data:', error);
      throw error;
    }
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
  }
};

export default simpleWeatherService;
