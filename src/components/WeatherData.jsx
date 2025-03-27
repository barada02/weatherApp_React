import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import simpleWeatherService from '../services/simpleWeatherService';
import './WeatherData.css';

const WeatherData = () => {
  const [city, setCity] = useState('Hyderabad');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Fetch all weather data on component mount or when city changes
  useEffect(() => {
    fetchAllWeatherData(city);
  }, [city]);

  const fetchAllWeatherData = async (location) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch current weather, forecast, and historical data in parallel
      const [currentData, forecastData, historyData] = await Promise.all([
        simpleWeatherService.getCurrentWeatherByCity(location),
        simpleWeatherService.getForecastByCity(location),
        simpleWeatherService.getHistoricalWeatherByCity(location, 7) // Get 7 days of historical data
      ]);
      
      setCurrentWeather(currentData);
      setForecast(forecastData);
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput);
      setSearchInput('');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateCurrentWeatherPDF = () => {
    if (!currentWeather) return;
    
    setGeneratingPdf(true);
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`Current Weather Report for ${city}`, 105, 15, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    // Add current weather data
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Current Weather Conditions', 14, 35);
    
    const currentWeatherData = [
      ['Parameter', 'Value'],
      ['Temperature', `${currentWeather.temperature}°C`],
      ['Feels Like', `${currentWeather.temperatureApparent || '-'}°C`],
      ['Humidity', `${currentWeather.humidity}%`],
      ['Wind Speed', `${currentWeather.windSpeed} km/h`],
      ['Wind Direction', `${currentWeather.windDirection}°`],
      ['Pressure', `${currentWeather.pressure} hPa`],
      ['Weather Condition', simpleWeatherService.getWeatherStatus(currentWeather.weatherCode)],
      ['Visibility', `${currentWeather.visibility || '-'} km`],
      ['Cloud Cover', `${currentWeather.cloudCover || '-'}%`],
      ['UV Index', currentWeather.uvIndex || '-']
    ];
    
    doc.autoTable({
      startY: 40,
      head: [currentWeatherData[0]],
      body: currentWeatherData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    doc.save(`${city}_current_weather_${new Date().toISOString().split('T')[0]}.pdf`);
    setGeneratingPdf(false);
  };

  const generateForecastPDF = () => {
    if (!forecast) return;
    
    setGeneratingPdf(true);
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`Weather Forecast Report for ${city}`, 105, 15, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    // Add hourly forecast data
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Hourly Forecast (Next 24 Hours)', 14, 35);
    
    const hourlyData = [
      ['Time', 'Temperature (°C)', 'Weather Condition']
    ];
    
    forecast.hourly.slice(0, 24).forEach(hour => {
      const date = new Date(hour.time);
      hourlyData.push([
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hour.temperature,
        simpleWeatherService.getWeatherStatus(hour.weatherCode)
      ]);
    });
    
    doc.autoTable({
      startY: 40,
      head: [hourlyData[0]],
      body: hourlyData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add daily forecast data
    const endY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Daily Forecast', 14, endY);
    
    const dailyData = [
      ['Date', 'Min Temp (°C)', 'Max Temp (°C)', 'Weather Condition']
    ];
    
    forecast.daily.forEach(day => {
      const date = new Date(day.time);
      dailyData.push([
        date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        day.temperatureMin,
        day.temperatureMax,
        simpleWeatherService.getWeatherStatus(day.weatherCode)
      ]);
    });
    
    doc.autoTable({
      startY: endY + 5,
      head: [dailyData[0]],
      body: dailyData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    doc.save(`${city}_forecast_${new Date().toISOString().split('T')[0]}.pdf`);
    setGeneratingPdf(false);
  };

  const generateHistoricalPDF = () => {
    if (!history) return;
    
    setGeneratingPdf(true);
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`Historical Weather Report for ${city}`, 105, 15, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    // Add daily historical data
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Historical Weather (Past 7 Days)', 14, 35);
    
    const dailyData = [
      ['Date', 'Avg Temp (°C)', 'Min Temp (°C)', 'Max Temp (°C)', 'Precipitation (mm)', 'Avg Humidity (%)']
    ];
    
    history.daily.forEach(day => {
      const date = new Date(day.time);
      dailyData.push([
        date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        day.temperatureAvg.toFixed(1),
        day.temperatureMin.toFixed(1),
        day.temperatureMax.toFixed(1),
        day.precipitationSum ? day.precipitationSum.toFixed(1) : '0.0',
        day.humidityAvg ? day.humidityAvg.toFixed(0) : '-'
      ]);
    });
    
    doc.autoTable({
      startY: 40,
      head: [dailyData[0]],
      body: dailyData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    doc.save(`${city}_historical_${new Date().toISOString().split('T')[0]}.pdf`);
    setGeneratingPdf(false);
  };

  const generateCompletePDF = () => {
    if (!currentWeather || !forecast || !history) return;
    
    setGeneratingPdf(true);
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`Complete Weather Report for ${city}`, 105, 15, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    // Add current weather data
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Current Weather Conditions', 14, 35);
    
    const currentWeatherData = [
      ['Parameter', 'Value'],
      ['Temperature', `${currentWeather.temperature}°C`],
      ['Feels Like', `${currentWeather.temperatureApparent || '-'}°C`],
      ['Humidity', `${currentWeather.humidity}%`],
      ['Wind Speed', `${currentWeather.windSpeed} km/h`],
      ['Pressure', `${currentWeather.pressure} hPa`],
      ['Weather Condition', simpleWeatherService.getWeatherStatus(currentWeather.weatherCode)]
    ];
    
    doc.autoTable({
      startY: 40,
      head: [currentWeatherData[0]],
      body: currentWeatherData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add hourly forecast data
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Hourly Forecast (Next 12 Hours)', 14, yPos);
    
    const hourlyData = [
      ['Time', 'Temperature (°C)', 'Weather Condition']
    ];
    
    forecast.hourly.slice(0, 12).forEach(hour => {
      const date = new Date(hour.time);
      hourlyData.push([
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hour.temperature,
        simpleWeatherService.getWeatherStatus(hour.weatherCode)
      ]);
    });
    
    doc.autoTable({
      startY: yPos + 5,
      head: [hourlyData[0]],
      body: hourlyData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add daily forecast data
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Daily Forecast', 14, yPos);
    
    const dailyData = [
      ['Date', 'Min Temp (°C)', 'Max Temp (°C)', 'Weather Condition']
    ];
    
    forecast.daily.forEach(day => {
      const date = new Date(day.time);
      dailyData.push([
        date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        day.temperatureMin,
        day.temperatureMax,
        simpleWeatherService.getWeatherStatus(day.weatherCode)
      ]);
    });
    
    doc.autoTable({
      startY: yPos + 5,
      head: [dailyData[0]],
      body: dailyData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add new page for historical data
    doc.addPage();
    
    // Add historical data title
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Historical Weather (Past 7 Days)', 14, 20);
    
    const historicalData = [
      ['Date', 'Avg Temp (°C)', 'Min Temp (°C)', 'Max Temp (°C)', 'Precipitation (mm)', 'Avg Humidity (%)']
    ];
    
    history.daily.forEach(day => {
      const date = new Date(day.time);
      historicalData.push([
        date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        day.temperatureAvg.toFixed(1),
        day.temperatureMin.toFixed(1),
        day.temperatureMax.toFixed(1),
        day.precipitationSum ? day.precipitationSum.toFixed(1) : '0.0',
        day.humidityAvg ? day.humidityAvg.toFixed(0) : '-'
      ]);
    });
    
    doc.autoTable({
      startY: 25,
      head: [historicalData[0]],
      body: historicalData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add footer
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Data provided by Tomorrow.io Weather API', 105, yPos, { align: 'center' });
    
    doc.save(`${city}_complete_weather_report_${new Date().toISOString().split('T')[0]}.pdf`);
    setGeneratingPdf(false);
  };

  return (
    <div className="weather-data-container">
      <div className="data-header">
        <h2>Weather Data Download</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for a city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>
      
      {loading && <div className="loading">Loading weather data...</div>}
      {error && <div className="error">{error}</div>}
      
      {currentWeather && forecast && history && !loading && (
        <div className="data-content">
          <div className="current-data-card">
            <h3>Current Weather in {city}</h3>
            <div className="weather-info">
              <div className="weather-main">
                <div className="temperature">{currentWeather.temperature}°C</div>
                <div className="weather-status">
                  {simpleWeatherService.getWeatherStatus(currentWeather.weatherCode)}
                </div>
              </div>
              <div className="weather-details">
                <div className="detail-item">
                  <span className="detail-label">Humidity:</span>
                  <span className="detail-value">{currentWeather.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Wind:</span>
                  <span className="detail-value">{currentWeather.windSpeed} km/h</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pressure:</span>
                  <span className="detail-value">{currentWeather.pressure} hPa</span>
                </div>
              </div>
            </div>
            <button 
              className="download-button"
              onClick={generateCurrentWeatherPDF}
              disabled={generatingPdf}
            >
              {generatingPdf ? 'Generating...' : 'Download Current Weather PDF'}
            </button>
          </div>
          
          <div className="data-options">
            <div className="data-card">
              <h3>Forecast Data</h3>
              <p>Download detailed forecast data including hourly and daily predictions.</p>
              <button 
                className="download-button"
                onClick={generateForecastPDF}
                disabled={generatingPdf}
              >
                {generatingPdf ? 'Generating...' : 'Download Forecast PDF'}
              </button>
            </div>
            
            <div className="data-card">
              <h3>Historical Data</h3>
              <p>Download historical weather data for the past 7 days.</p>
              <button 
                className="download-button"
                onClick={generateHistoricalPDF}
                disabled={generatingPdf}
              >
                {generatingPdf ? 'Generating...' : 'Download Historical PDF'}
              </button>
            </div>
            
            <div className="data-card full-width">
              <h3>Complete Weather Report</h3>
              <p>Download a comprehensive report with current, forecast, and historical weather data.</p>
              <button 
                className="download-button primary"
                onClick={generateCompletePDF}
                disabled={generatingPdf}
              >
                {generatingPdf ? 'Generating...' : 'Download Complete Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherData;
