import { useState, useEffect } from 'react';
import weatherService from '../services/weatherService';
import { getCurrentPosition } from '../utils/geolocation';

const WeatherTest = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user's current location
        const position = await getCurrentPosition();
        setLocation(position);
        
        // Fetch current weather data
        const weatherData = await weatherService.getCurrentWeather(
          position.latitude,
          position.longitude
        );
        
        setWeather(weatherData);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err.message || 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) return <div>Loading weather data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!weather) return <div>No weather data available</div>;

  return (
    <div className="weather-test">
      <h2>Weather Test Component</h2>
      <div className="location-info">
        <h3>Location</h3>
        <p>Latitude: {location?.latitude}</p>
        <p>Longitude: {location?.longitude}</p>
      </div>
      
      <div className="weather-info">
        <h3>Current Weather</h3>
        <pre>{JSON.stringify(weather, null, 2)}</pre>
      </div>
    </div>
  );
};

export default WeatherTest;
