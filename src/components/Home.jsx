import React, { useState, useEffect } from 'react';
import './Home.css';
import simpleWeatherService from '../services/simpleWeatherService';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCity, setCurrentCity] = useState('Hyderabad'); // Track current displayed city
  const defaultCity = 'Hyderabad';

  useEffect(() => {
    // Fetch current weather for default city on component mount
    fetchWeatherData(defaultCity);
  }, []);

  const fetchWeatherData = async (city) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch current weather and forecast in parallel
      const [currentData, forecastData] = await Promise.all([
        simpleWeatherService.getCurrentWeatherByCity(city),
        simpleWeatherService.getForecastByCity(city)
      ]);
      
      setCurrentWeather(currentData);
      setForecast(forecastData);
      setCurrentCity(city); // Update current city being displayed
      console.log('Weather data:', currentData);
      console.log('Forecast data:', forecastData);
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
      setSearchQuery(''); // Clear search input after search
    }
  };

  // Function to get weather icon based on weather code
  const getWeatherIcon = (code) => {
    // Simple mapping of weather codes to emoji icons
    const iconMap = {
      1000: '☀️', // Clear
      1001: '☁️', // Cloudy
      1100: '🌤️', // Mostly Clear
      1101: '⛅', // Partly Cloudy
      1102: '🌥️', // Mostly Cloudy
      2000: '🌫️', // Fog
      2100: '🌫️', // Light Fog
      4000: '🌦️', // Drizzle
      4001: '🌧️', // Drizzle Rain
      4200: '🌧️', // Light Rain
      4201: '🌧️', // Heavy Rain
      5000: '❄️', // Snow
      5001: '⛈️', // Light Thunder
      8000: '☀️', // Mostly Sunny
    };
    
    const status = simpleWeatherService.getWeatherStatus(code);
    return {
      icon: iconMap[code] || '❓',
      status
    };
  };

  // Format time from ISO string to readable format (e.g., "3 PM")
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
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
        <div className="popular-cities-header">
          <span>Popular Cities</span>
          <a href="#" className="view-more">View more</a>
        </div>
        <div className="popular-cities-list">
          {[
            { name: 'Delhi', status: 'Partly Cloudy', code: 1101 },
            { name: 'Mumbai', status: 'Drizzle Rain', code: 4001 },
            { name: 'Hyderabad', status: 'Heavy Rain', code: 4201 },
            { name: 'Bangalore', status: 'Light Thunder', code: 5001 },
            { name: 'Kolkata', status: 'Mostly Sunny', code: 8000 },
            { name: 'Pune', status: 'Clear', code: 1000 },
            { name: 'Visakhapatnam', status: 'Cloudy', code: 1001 },
            { name: 'Bhubaneswar', status: 'Light Rain', code: 4200 }
          ].map((city, index) => (
            <div 
              key={index} 
              className="popular-city-item" 
              onClick={() => fetchWeatherData(city.name)}
            >
              <div className="city-weather-icon">
                {getWeatherIcon(city.code).icon}
              </div>
              <div className="city-name">{city.name}</div>
              <div className="city-weather-status">{city.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hourly-forecast-container">
        <h5>Hourly Forecast for {currentCity}</h5>
        {loading ? (
          <div className="loading">Loading forecast data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : forecast && forecast.hourly ? (
          <div className="hourly-forecast-content">
            <div className="hourly-forecast-scroll">
              {forecast.hourly.slice(0, 24).map((hour, index) => (
                <div className="hourly-item" key={index}>
                  <div className="hourly-time">{formatTime(hour.time)}</div>
                  <div className="hourly-icon">
                    {getWeatherIcon(hour.weatherCode).icon}
                  </div>
                  <div className="hourly-temp">{Math.round(hour.temperature)}°</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-data">No forecast data available</div>
        )}
      </div>
      
    </div>
  );
};

export default Home;
