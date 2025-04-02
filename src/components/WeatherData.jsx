import React, { useState, useEffect } from 'react';
import simpleWeatherService from '../services/simpleWeatherService';
import pdfReportService from '../services/pdfReportService';
import ErrorDisplay from './ErrorDisplay';
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
  const [selectedReportType, setSelectedReportType] = useState('comprehensive');
  const [customSections, setCustomSections] = useState({
    current: true,
    hourly: true,
    daily: true,
    historical: false
  });
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Fetch all weather data on component mount or when city changes
  useEffect(() => {
    fetchAllWeatherData(city);
  }, [city]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (downloadSuccess) {
      const timer = setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [downloadSuccess]);

  const fetchAllWeatherData = async (location) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate the city input
      if (!location.trim()) {
        throw new Error('Please enter a city name');
      }
      
      // Fetch all data in parallel
      const [currentData, forecastData, historyData] = await Promise.all([
        simpleWeatherService.getCurrentWeatherByCity(location),
        simpleWeatherService.getForecastByCity(location),
        simpleWeatherService.getHistoricalWeatherByCity(location, 7) // Get 7 days of historical data
      ]);
      
      setCurrentWeather(currentData);
      setForecast(forecastData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentWeather(null);
    setForecast(null);
    setHistory(null);
    
    try {
      // Validate the city input
      if (!searchInput.trim()) {
        throw new Error('Please enter a city name');
      }
      
      // Fetch all data in parallel
      const [currentData, forecastData, historyData] = await Promise.all([
        simpleWeatherService.getCurrentWeatherByCity(searchInput),
        simpleWeatherService.getForecastByCity(searchInput),
        simpleWeatherService.getHistoricalWeatherByCity(searchInput, 7) // Get 7 days of historical data
      ]);
      
      setCurrentWeather(currentData);
      setForecast(forecastData);
      setHistory(historyData);
      setCity(searchInput);
      setSearchInput('');
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (type) => {
    setSelectedReportType(type);
  };

  const handleSectionToggle = (section) => {
    setCustomSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateAndDownloadPDF = async () => {
    if (!currentWeather || !forecast) return;
    
    setGeneratingPdf(true);
    setError(null);
    
    try {
      let pdfBlob;
      
      // Check which report type is selected
      switch (selectedReportType) {
        case 'comprehensive':
          pdfBlob = pdfReportService.generateWeatherReportPDF(currentWeather, forecast, history, city);
          break;
        case 'current':
          pdfBlob = pdfReportService.generateCustomReportPDF(
            { current: currentWeather.data.values },
            city,
            ['current']
          );
          break;
        case 'forecast':
          pdfBlob = pdfReportService.generateCustomReportPDF(
            { 
              hourly: forecast.hourly.slice(0, 24),
              daily: forecast.daily
            },
            city,
            ['hourly', 'daily']
          );
          break;
        case 'historical':
          pdfBlob = pdfReportService.generateCustomReportPDF(
            { daily: history.daily },
            city,
            ['daily']
          );
          break;
        case 'custom':
          const sections = [];
          const data = {};
          
          if (customSections.current) {
            sections.push('current');
            data.current = currentWeather.data.values;
          }
          
          if (customSections.hourly) {
            sections.push('hourly');
            data.hourly = forecast.hourly.slice(0, 24);
          }
          
          if (customSections.daily) {
            sections.push('daily');
            data.daily = forecast.daily;
          }
          
          if (customSections.historical && history) {
            sections.push('historical');
            data.historical = history.daily;
          }
          
          pdfBlob = pdfReportService.generateCustomReportPDF(data, city, sections);
          break;
        default:
          pdfBlob = pdfReportService.generateWeatherReportPDF(currentWeather, forecast, history, city);
      }
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${city}_weather_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadSuccess(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="weather-data-container">
      <div className="data-header">
        <h2>Weather Reports</h2>
        <p className="data-subtitle">Generate and download detailed weather reports for any city</p>
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
      
      {loading && <div className="loading-overlay"><div className="loader"></div></div>}
      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={() => handleSearch({ preventDefault: () => {} })} 
          onDismiss={() => setError(null)} 
        />
      )}
      {downloadSuccess && <div className="success-message">Report downloaded successfully!</div>}
      
      {currentWeather && forecast && !loading && (
        <div className="data-content">
          <div className="report-options-container">
            <div className="current-data-card">
              <div className="city-weather-preview">
                <h3>{city}</h3>
                <div className="weather-preview-content">
                  <div className="temperature-display">
                    {Math.round(currentWeather.data.values.temperature)}°C
                  </div>
                  <div className="weather-status">
                    {simpleWeatherService.getWeatherStatus(currentWeather.data.values.weatherCode)}
                  </div>
                </div>
                <div className="weather-details-preview">
                  <div className="detail-item">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{currentWeather.data.values.humidity}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Wind</span>
                    <span className="detail-value">{Math.round(currentWeather.data.values.windSpeed)} km/h</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="report-type-selector">
              <h3>Select Report Type</h3>
              <div className="report-types">
                <div 
                  className={`report-type-option ${selectedReportType === 'comprehensive' ? 'selected' : ''}`}
                  onClick={() => handleReportTypeChange('comprehensive')}
                >
                  <div className="report-icon">📊</div>
                  <div className="report-type-name">Comprehensive</div>
                  <div className="report-type-desc">Complete weather report with all available data</div>
                </div>
                
                <div 
                  className={`report-type-option ${selectedReportType === 'current' ? 'selected' : ''}`}
                  onClick={() => handleReportTypeChange('current')}
                >
                  <div className="report-icon">🌡️</div>
                  <div className="report-type-name">Current Weather</div>
                  <div className="report-type-desc">Current conditions only</div>
                </div>
                
                <div 
                  className={`report-type-option ${selectedReportType === 'forecast' ? 'selected' : ''}`}
                  onClick={() => handleReportTypeChange('forecast')}
                >
                  <div className="report-icon">📅</div>
                  <div className="report-type-name">Forecast</div>
                  <div className="report-type-desc">Hourly and daily forecast</div>
                </div>
                
                <div 
                  className={`report-type-option ${selectedReportType === 'historical' ? 'selected' : ''}`}
                  onClick={() => handleReportTypeChange('historical')}
                >
                  <div className="report-icon">📜</div>
                  <div className="report-type-name">Historical</div>
                  <div className="report-type-desc">Past 7 days weather data</div>
                </div>
                
                <div 
                  className={`report-type-option ${selectedReportType === 'custom' ? 'selected' : ''}`}
                  onClick={() => handleReportTypeChange('custom')}
                >
                  <div className="report-icon">⚙️</div>
                  <div className="report-type-name">Custom</div>
                  <div className="report-type-desc">Select specific data sections</div>
                </div>
              </div>
              
              {selectedReportType === 'custom' && (
                <div className="custom-sections">
                  <h4>Select Sections to Include</h4>
                  <div className="section-checkboxes">
                    <label className="section-checkbox">
                      <input 
                        type="checkbox" 
                        checked={customSections.current} 
                        onChange={() => handleSectionToggle('current')}
                      />
                      <span>Current Weather</span>
                    </label>
                    
                    <label className="section-checkbox">
                      <input 
                        type="checkbox" 
                        checked={customSections.hourly} 
                        onChange={() => handleSectionToggle('hourly')}
                      />
                      <span>Hourly Forecast</span>
                    </label>
                    
                    <label className="section-checkbox">
                      <input 
                        type="checkbox" 
                        checked={customSections.daily} 
                        onChange={() => handleSectionToggle('daily')}
                      />
                      <span>Daily Forecast</span>
                    </label>
                    
                    <label className="section-checkbox">
                      <input 
                        type="checkbox" 
                        checked={customSections.historical} 
                        onChange={() => handleSectionToggle('historical')}
                      />
                      <span>Historical Data</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div className="download-section">
              <button 
                className="download-button"
                onClick={generateAndDownloadPDF}
                disabled={generatingPdf}
              >
                {generatingPdf ? (
                  <>
                    <span className="spinner"></span>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <span className="download-icon">📥</span>
                    <span>Download Report</span>
                  </>
                )}
              </button>
              <p className="download-info">
                PDF reports include detailed weather information formatted for easy reading and sharing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherData;
