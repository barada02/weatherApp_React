import React, { useState, useEffect } from 'react';
import './Home.css';
import simpleWeatherService from '../services/simpleWeatherService';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const defaultCity = 'Hyderabad';

  useEffect(() => {
    // Fetch current weather for default city on component mount
    fetchWeatherData(defaultCity);
  }, []);

  const fetchWeatherData = async (city) => {
    try {
      setLoading(true);
      setError(null);
      const data = await simpleWeatherService.getCurrentWeatherByCity(city);
      setCurrentWeather(data);
      console.log('Weather data:', data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeatherData(searchQuery);
    }
  };

  // Function to get weather icon based on weather code
  const getWeatherIcon = (code) => {
    // Simple mapping of weather codes to emoji icons
    const iconMap = {
      'Clear': '☀️',
      'Cloudy': '☁️',
      'Mostly Clear': '🌤️',
      'Partly Cloudy': '⛅',
      'Mostly Cloudy': '🌥️',
      'Fog': '🌫️',
      'Light Fog': '🌫️',
      'Drizzle': '🌦️',
      'Light Rain': '🌧️',
      'Snow': '❄️',
      'Unknown': '❓'
    };
    
    const status = simpleWeatherService.getWeatherStatus(code);
    return {
      icon: iconMap[status] || '❓',
      status
    };
  };

  return (
    <div className="home-container">
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <i className="search-icon">&#x1F50D;</i>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for a city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>

      <div className="current-weather-container">
        <h5>Current Weather</h5>
        {loading ? (
          <div className="loading">Loading weather data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : currentWeather ? (
          <div className="weather-content">
            <div className="weather-header">
              <div className="city-info">
                <h2>{currentWeather.location.name}</h2>
                <p className="date-time">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="temperature-display">
                <h1>{Math.round(currentWeather.data.values.temperature)}°C</h1>
                {currentWeather.data.values.weatherCode && (
                  <div className="weather-status">
                    <span className="weather-icon">
                      {getWeatherIcon(currentWeather.data.values.weatherCode).icon}
                    </span>
                    <span className="status-text">
                      {getWeatherIcon(currentWeather.data.values.weatherCode).status}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <span className="detail-label">Cloud Cover</span>
                <span className="detail-value">{currentWeather.data.values.cloudCover}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{currentWeather.data.values.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Wind Speed</span>
                <span className="detail-value">{Math.round(currentWeather.data.values.windSpeed)} km/h</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">UV Index</span>
                <span className="detail-value">{currentWeather.data.values.uvIndex}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">No weather data available</div>
        )}
      </div>

      <div className="middle-space">
        {/* Empty space between current weather and popular cities */}
      </div>

      <div className="popular-cities-container">
        <h5>Popular Cities</h5>
        {/* Popular cities content will go here */}
      </div>

      <div className="hourly-forecast-container">
        <h5>Hourly Forecast</h5>
        {/* Hourly forecast content will go here */}
      </div>
      
    </div>
  );
};

export default Home;
