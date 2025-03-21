import { useState } from 'react';
import simpleWeatherService from '../services/simpleWeatherService';

const SimpleWeather = () => {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!city.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await simpleWeatherService.getCurrentWeatherByCity(city);
      console.log('Weather data:', data); // For debugging
      setWeatherData(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-weather">
      <h2>Weather Search</h2>
      
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && <div className="error-message">Error: {error}</div>}
      
      {weatherData && (
        <div className="weather-display">
          <h3>Weather for {weatherData.location.name}</h3>
          
          <div className="weather-data">
            <div className="data-item">
              <span className="label">Temperature:</span>
              <span className="value">{weatherData.data.values.temperature}°C</span>
            </div>
            
            <div className="data-item">
              <span className="label">Humidity:</span>
              <span className="value">{weatherData.data.values.humidity}%</span>
            </div>
            
            <div className="data-item">
              <span className="label">Wind Speed:</span>
              <span className="value">{weatherData.data.values.windSpeed} m/s</span>
            </div>
            
            <div className="data-item">
              <span className="label">Weather Code:</span>
              <span className="value">{weatherData.data.values.weatherCode}</span>
            </div>
            
            <div className="data-item">
              <span className="label">UV Index:</span>
              <span className="value">{weatherData.data.values.uvIndex}</span>
            </div>
            
            <div className="data-item">
              <span className="label">Cloud Cover:</span>
              <span className="value">{weatherData.data.values.cloudCover}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleWeather;
