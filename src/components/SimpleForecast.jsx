import { useState } from 'react';
import simpleWeatherService from '../services/simpleWeatherService';

const SimpleForecast = () => {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!city.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await simpleWeatherService.getForecastByCity(city);
      console.log('Forecast data:', data); // For debugging
      setForecastData(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch forecast data');
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  // Format date for daily forecast (without time)
  const formatDay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="simple-forecast">
      <h2>Weather Forecast</h2>
      
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
      
      {forecastData && (
        <div className="forecast-display">
          <h3>Forecast for {forecastData.location.name}</h3>
          
          <div className="forecast-section">
            <h4>Hourly Forecast</h4>
            <div className="hourly-forecast">
              {forecastData.hourly.slice(0, 24).map((hour, index) => (
                <div key={index} className="forecast-item hourly-item">
                  <div className="forecast-time">{formatDate(hour.time)}</div>
                  <div className="forecast-temp">{hour.temperature}°C</div>
                  <div className="forecast-code">Code: {hour.weatherCode}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="forecast-section">
            <h4>Daily Forecast</h4>
            <div className="daily-forecast">
              {forecastData.daily.map((day, index) => (
                <div key={index} className="forecast-item daily-item">
                  <div className="forecast-day">{formatDay(day.time)}</div>
                  <div className="forecast-temp-range">
                    <span className="max-temp">{day.temperatureMax}°C</span>
                    <span className="temp-separator"> / </span>
                    <span className="min-temp">{day.temperatureMin}°C</span>
                  </div>
                  <div className="forecast-code">Code: {day.weatherCode}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleForecast;
