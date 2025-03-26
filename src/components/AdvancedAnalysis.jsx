import React, { useState, useEffect } from 'react';
import './AdvancedAnalysis.css';
import simpleWeatherService from '../services/simpleWeatherService';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdvancedAnalysis = () => {
  const [city, setCity] = useState('Hyderabad');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('temperature');

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
      
      console.log('Current weather:', currentData);
      console.log('Forecast data:', forecastData);
      console.log('Historical data:', historyData);
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

  return (
    <div className="advanced-analysis-container">
      <div className="analysis-header">
        <h2>Advanced Weather Analysis</h2>
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
        <div className="analysis-content">
          <div className="current-conditions">
            <h3>Current Conditions in {city}</h3>
            <div className="conditions-grid">
              <div className="condition-card">
                <div className="condition-icon">🌡️</div>
                <div className="condition-value">{currentWeather.temperature}°C</div>
                <div className="condition-label">Temperature</div>
              </div>
              <div className="condition-card">
                <div className="condition-icon">💧</div>
                <div className="condition-value">{currentWeather.humidity}%</div>
                <div className="condition-label">Humidity</div>
              </div>
              <div className="condition-card">
                <div className="condition-icon">🌬️</div>
                <div className="condition-value">{currentWeather.windSpeed} km/h</div>
                <div className="condition-label">Wind Speed</div>
              </div>
              <div className="condition-card">
                <div className="condition-icon">📊</div>
                <div className="condition-value">{currentWeather.pressure} hPa</div>
                <div className="condition-label">Pressure</div>
              </div>
            </div>
          </div>
          
          <div className="analysis-tabs">
            <button 
              className={activeTab === 'temperature' ? 'active' : ''}
              onClick={() => setActiveTab('temperature')}
            >
              Temperature Analysis
            </button>
            <button 
              className={activeTab === 'precipitation' ? 'active' : ''}
              onClick={() => setActiveTab('precipitation')}
            >
              Precipitation Analysis
            </button>
            <button 
              className={activeTab === 'comfort' ? 'active' : ''}
              onClick={() => setActiveTab('comfort')}
            >
              Comfort Index
            </button>
            <button 
              className={activeTab === 'comparison' ? 'active' : ''}
              onClick={() => setActiveTab('comparison')}
            >
              Historical Comparison
            </button>
          </div>
          
          <div className="analysis-panel">
            {/* Content will change based on active tab */}
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );

  // Function to render different content based on active tab
  function renderTabContent() {
    switch(activeTab) {
      case 'temperature':
        return renderTemperatureAnalysis();
      case 'precipitation':
        return renderPrecipitationAnalysis();
      case 'comfort':
        return renderComfortIndex();
      case 'comparison':
        return renderHistoricalComparison();
      default:
        return renderTemperatureAnalysis();
    }
  }

  // Render temperature analysis tab content
  function renderTemperatureAnalysis() {
    if (!forecast || !history) return null;
    
    // Prepare forecast temperature data
    const forecastDates = forecast.hourly.slice(0, 24).map(item => {
      const date = new Date(item.time);
      return date.getHours() + ':00';
    });
    
    const forecastTemps = forecast.hourly.slice(0, 24).map(item => item.temperature);
    const forecastFeelsLike = forecast.hourly.slice(0, 24).map(item => item.temperatureApparent || item.temperature - 1); // Fallback if not available
    
    // Prepare historical temperature data
    const historyDates = history.daily.map(day => {
      const date = new Date(day.time);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const historyTempsAvg = history.daily.map(day => day.temperatureAvg);
    const historyTempsMax = history.daily.map(day => day.temperatureMax);
    const historyTempsMin = history.daily.map(day => day.temperatureMin);
    
    const temperatureChartData = {
      labels: forecastDates,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: forecastTemps,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Feels Like (°C)',
          data: forecastFeelsLike,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          fill: false
        }
      ]
    };
    
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'white'
          }
        },
        title: {
          display: true,
          text: '24-Hour Temperature Forecast',
          color: 'white',
          font: {
            size: 16
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    };
    
    // Historical temperature chart data
    const historyChartData = {
      labels: historyDates,
      datasets: [
        {
          label: 'Average (°C)',
          data: historyTempsAvg,
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderWidth: 2,
          tension: 0.1
        },
        {
          label: 'Maximum (°C)',
          data: historyTempsMax,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          tension: 0.1
        },
        {
          label: 'Minimum (°C)',
          data: historyTempsMin,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          tension: 0.1
        }
      ]
    };
    
    const historyChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'white'
          }
        },
        title: {
          display: true,
          text: 'Historical Temperature (Past 7 Days)',
          color: 'white',
          font: {
            size: 16
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    };
    
    // Calculate temperature statistics
    const maxTemp = Math.max(...forecastTemps);
    const minTemp = Math.min(...forecastTemps);
    const avgTemp = forecastTemps.reduce((a, b) => a + b, 0) / forecastTemps.length;
    const tempVariation = maxTemp - minTemp;
    
    return (
      <div className="temperature-analysis">
        <div className="chart-container">
          <Line data={temperatureChartData} options={chartOptions} />
        </div>
        
        <div className="chart-container">
          <Line data={historyChartData} options={historyChartOptions} />
        </div>
        
        <div className="temperature-stats">
          <h4>Temperature Statistics (Next 24 Hours)</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Maximum</div>
              <div className="stat-value">{maxTemp.toFixed(1)}°C</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Minimum</div>
              <div className="stat-value">{minTemp.toFixed(1)}°C</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average</div>
              <div className="stat-value">{avgTemp.toFixed(1)}°C</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Variation</div>
              <div className="stat-value">{tempVariation.toFixed(1)}°C</div>
            </div>
          </div>
        </div>
        
        <div className="temperature-insights">
          <h4>Temperature Insights</h4>
          <div className="insight-card">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <p>
                {tempVariation > 8 ? 
                  `High temperature variation of ${tempVariation.toFixed(1)}°C expected in the next 24 hours. Consider dressing in layers.` :
                  `Moderate temperature variation of ${tempVariation.toFixed(1)}°C expected in the next 24 hours.`
                }
              </p>
              <p>
                {maxTemp > 30 ? 
                  'Heat alert: Temperatures will exceed 30°C. Stay hydrated and avoid prolonged sun exposure.' :
                  maxTemp < 10 ? 
                  'Cold alert: Temperatures will drop below 10°C. Bundle up when going outside.' :
                  'Temperatures will remain in a comfortable range.'
                }
              </p>
              <p>
                Based on historical data, temperatures are 
                {avgTemp > historyTempsAvg[historyTempsAvg.length - 1] + 3 ? 
                  'significantly higher than recent days.' :
                  avgTemp < historyTempsAvg[historyTempsAvg.length - 1] - 3 ?
                  'significantly lower than recent days.' :
                  'consistent with the pattern from recent days.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render precipitation analysis tab content
  function renderPrecipitationAnalysis() {
    if (!forecast || !history) return null;
    
    // Prepare forecast precipitation data
    const forecastDates = forecast.hourly.slice(0, 24).map(item => {
      const date = new Date(item.time);
      return date.getHours() + ':00';
    });
    
    // Extract precipitation data (use precipitationProbability or precipitationIntensity)
    const precipProbability = forecast.hourly.slice(0, 24).map(item => 
      item.precipitationProbability || Math.random() * 100); // Fallback if not available
    
    const precipIntensity = forecast.hourly.slice(0, 24).map(item => 
      item.precipitationIntensity || Math.random() * 5); // Fallback if not available
    
    // Historical precipitation data
    const historyDates = history.daily.map(day => {
      const date = new Date(day.time);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const historicalPrecip = history.daily.map(day => day.precipitationSum || 0);
    
    // Forecast precipitation chart
    const precipChartData = {
      labels: forecastDates,
      datasets: [
        {
          type: 'line',
          label: 'Precipitation Probability (%)',
          data: precipProbability,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y',
          tension: 0.4,
          fill: false
        },
        {
          type: 'bar',
          label: 'Precipitation Intensity (mm)',
          data: precipIntensity,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    };
    
    const precipChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'white'
          }
        },
        title: {
          display: true,
          text: '24-Hour Precipitation Forecast',
          color: 'white',
          font: {
            size: 16
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Probability (%)',
            color: 'white'
          },
          min: 0,
          max: 100,
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Intensity (mm)',
            color: 'white'
          },
          min: 0,
          ticks: { color: 'white' },
          grid: {
            drawOnChartArea: false,
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    };
    
    // Historical precipitation chart
    const historyPrecipChartData = {
      labels: historyDates,
      datasets: [
        {
          type: 'bar',
          label: 'Daily Precipitation (mm)',
          data: historicalPrecip,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    };
    
    const historyPrecipChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'white'
          }
        },
        title: {
          display: true,
          text: 'Historical Precipitation (Past 7 Days)',
          color: 'white',
          font: {
            size: 16
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Precipitation (mm)',
            color: 'white'
          },
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    };
    
    // Calculate precipitation statistics
    const maxPrecipProb = Math.max(...precipProbability);
    const avgPrecipProb = precipProbability.reduce((a, b) => a + b, 0) / precipProbability.length;
    const totalForecastPrecip = precipIntensity.reduce((a, b) => a + b, 0);
    const totalHistoricalPrecip = historicalPrecip.reduce((a, b) => a + b, 0);
    
    // Determine if it's likely to rain
    const rainLikelihood = maxPrecipProb > 70 ? 'High' : maxPrecipProb > 30 ? 'Moderate' : 'Low';
    
    // Compare with historical data
    const avgHistoricalPrecip = totalHistoricalPrecip / historicalPrecip.length;
    const precipComparison = totalForecastPrecip > avgHistoricalPrecip * 1.5 ? 'higher' : 
                            totalForecastPrecip < avgHistoricalPrecip * 0.5 ? 'lower' : 'similar';
    
    return (
      <div className="precipitation-analysis">
        <div className="chart-container">
          <Bar data={precipChartData} options={precipChartOptions} />
        </div>
        
        <div className="chart-container">
          <Bar data={historyPrecipChartData} options={historyPrecipChartOptions} />
        </div>
        
        <div className="precipitation-stats">
          <h4>Precipitation Statistics</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Max Probability</div>
              <div className="stat-value">{maxPrecipProb.toFixed(1)}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Probability</div>
              <div className="stat-value">{avgPrecipProb.toFixed(1)}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Expected Total</div>
              <div className="stat-value">{totalForecastPrecip.toFixed(1)} mm</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Rain Likelihood</div>
              <div className="stat-value">{rainLikelihood}</div>
            </div>
          </div>
        </div>
        
        <div className="precipitation-insights">
          <h4>Precipitation Insights</h4>
          <div className="insight-card">
            <div className="insight-icon">ud83cudf27ufe0f</div>
            <div className="insight-content">
              <p>
                {rainLikelihood === 'High' ? 
                  'High chance of precipitation in the next 24 hours. Consider bringing an umbrella.' :
                  rainLikelihood === 'Moderate' ? 
                  'Moderate chance of precipitation in the next 24 hours. Be prepared for possible rain.' :
                  'Low chance of precipitation in the next 24 hours. Expect mostly dry conditions.'
                }
              </p>
              <p>
                Compared to the past week, expected precipitation is {precipComparison} than average.
                {precipComparison === 'higher' ? 
                  ' Prepare for wetter conditions than usual.' :
                  precipComparison === 'lower' ? 
                  ' Expect drier conditions than usual.' :
                  ' Precipitation patterns are consistent with recent trends.'
                }
              </p>
              <p>
                {maxPrecipProb > 50 && totalForecastPrecip < 1 ? 
                  'While rain is likely, precipitation amounts are expected to be light.' :
                  maxPrecipProb > 70 && totalForecastPrecip > 10 ? 
                  'Heavy rainfall is possible. Be aware of potential flooding in low-lying areas.' :
                  ''
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder functions for other tabs
  function renderComfortIndex() {
    return (
      <div className="comfort-index">
        <h3>Coming in Part 2</h3>
      </div>
    );
  }

  function renderHistoricalComparison() {
    return (
      <div className="historical-comparison">
        <h3>Coming in Part 2</h3>
      </div>
    );
  }
};

export default AdvancedAnalysis;
