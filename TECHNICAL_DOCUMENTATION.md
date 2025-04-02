# Weather Application - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
3. [API Integration](#api-integration)
4. [PDF Report Generation](#pdf-report-generation)
5. [Error Handling](#error-handling)
6. [API Key Rotation Strategy](#api-key-rotation-strategy)

## Architecture Overview

The Weather Application is built using React with a component-based architecture. It follows modern React practices using functional components and hooks for state management. The application is bundled using Vite, which provides fast development and optimized production builds.

### Project Structure

```
src/
├── components/     # UI components
├── services/       # API and utility services
├── App.jsx         # Main application component
├── main.jsx        # Application entry point
└── assets/         # Static assets
```

## Key Components

### App Component

The App component serves as the main container and handles routing between different sections of the application.

```jsx
function App() {
  const [activePage, setActivePage] = useState('home')

  const handleNavigation = (page) => {
    setActivePage(page)
  }

  // Render the appropriate content based on the active page
  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return <Home />
      case 'advanced':
        return <AdvancedAnalysis />
      case 'data':
        return <WeatherData />
      case 'settings':
        return <div className="placeholder-content">Settings page coming soon</div>
      default:
        return <Home />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar onNavigate={handleNavigation} />
      <main className="content-area">
        {renderContent()}
      </main>
      <ApiUsageStats />
    </div>
  )
}
```

**Technical Notes:**
- Uses the `useState` hook to track the active page
- Implements a simple routing mechanism with the `renderContent` function
- Includes the `ApiUsageStats` component globally to monitor API usage across all pages

### Home Component

The Home component displays current weather conditions and hourly forecasts for a selected city.

```jsx
// Key state variables in Home component
const [currentWeather, setCurrentWeather] = useState(null);
const [forecast, setForecast] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [currentCity, setCurrentCity] = useState('Hyderabad');
const [popularCities, setPopularCities] = useState([...]);

// Data fetching function
const fetchWeatherData = async (city) => {
  setLoading(true);
  setError(null);
  
  try {
    // Validate city input
    if (!city || !city.trim()) {
      throw new Error('Please enter a valid city name');
    }
    
    // Fetch current weather and forecast in parallel
    const [currentData, forecastData] = await Promise.all([
      simpleWeatherService.getCurrentWeatherByCity(city),
      simpleWeatherService.getForecastByCity(city)
    ]);
    
    setCurrentWeather(currentData);
    setForecast(forecastData);
    setCurrentCity(city);
  } catch (error) {
    console.error('Error fetching weather:', error);
    setError(error);
  } finally {
    setLoading(false);
  }
};
```

**Technical Notes:**
- Uses `Promise.all` to fetch multiple API endpoints concurrently
- Implements proper loading and error states
- Stores popular cities in state and persists them to localStorage

## API Integration

### Weather Service

The `simpleWeatherService.js` file handles all interactions with the Tomorrow.io weather API. It includes methods for fetching current weather, forecasts, and historical data.

#### API Key Rotation Implementation

```javascript
// API keys configuration with rotation strategy
const API_KEYS = {
  current: import.meta.env.VITE_TOMORROW_API_KEY1,
  forecast: import.meta.env.VITE_TOMORROW_API_KEY2,
  historical: import.meta.env.VITE_TOMORROW_API_KEY3
};

// Fallback mechanism
const API_KEY_FALLBACKS = {
  current: [import.meta.env.VITE_TOMORROW_API_KEY1, import.meta.env.VITE_TOMORROW_API_KEY2, import.meta.env.VITE_TOMORROW_API_KEY3],
  forecast: [import.meta.env.VITE_TOMORROW_API_KEY2, import.meta.env.VITE_TOMORROW_API_KEY3, import.meta.env.VITE_TOMORROW_API_KEY1],
  historical: [import.meta.env.VITE_TOMORROW_API_KEY3, import.meta.env.VITE_TOMORROW_API_KEY1, import.meta.env.VITE_TOMORROW_API_KEY2]
};
```

#### Request Throttling

```javascript
// Request throttling mechanism
let lastRequestTime = {
  current: 0,
  forecast: 0,
  historical: 0
};
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests of the same type

/**
 * Throttle API requests to avoid hitting rate limits
 */
const throttleRequest = async (requestType) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime[requestType];
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    // Calculate how long to wait
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Throttling ${requestType} API request. Waiting ${waitTime}ms...`);
    
    // Wait for the required time
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Update the last request time
  lastRequestTime[requestType] = Date.now();
};
```

#### Centralized API Request Handler

```javascript
/**
 * Make an API request with automatic key rotation on failure
 */
const makeApiRequest = async (requestType, endpoint, params, attempt = 0) => {
  // Prevent infinite recursion
  if (attempt >= API_KEY_FALLBACKS[requestType].length) {
    throw new WeatherServiceError(
      ErrorTypes.RATE_LIMIT_EXCEEDED,
      'All API keys have been rate limited. Please try again later.',
      null
    );
  }
  
  // Throttle requests of the same type
  await throttleRequest(requestType);
  
  // Get the appropriate API key based on attempt number
  const apiKey = getApiKey(requestType, attempt);
  
  try {
    // Make the API request
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      params: {
        ...params,
        apikey: apiKey
      }
    });
    
    // Reset fail count on success
    apiKeyStatus[requestType].failCount = 0;
    apiKeyStatus[requestType].isValid = true;
    apiKeyStatus[requestType].lastCheck = new Date().toISOString();
    
    // Increment request counters
    apiRequestCount[requestType]++;
    apiRequestCount.total++;
    
    return response.data;
  } catch (error) {
    const parsedError = parseApiError(error, requestType);
    
    // If rate limited or invalid key, try the next key
    if (
      parsedError.type === ErrorTypes.RATE_LIMIT_EXCEEDED ||
      parsedError.type === ErrorTypes.INVALID_API_KEY
    ) {
      console.log(`API key issue with ${requestType} key ${attempt + 1}. Trying next key...`);
      return makeApiRequest(requestType, endpoint, params, attempt + 1);
    }
    
    // For other errors, just throw
    throw parsedError;
  }
};
```

**Technical Notes:**
- Implements a sophisticated API key rotation strategy to prevent rate limiting
- Uses separate keys for different request types (current, forecast, historical)
- Includes automatic fallback to alternative keys when rate limits are hit
- Implements request throttling to space out API calls

## PDF Report Generation

The `pdfReportService.js` file handles the generation of PDF reports using jsPDF and jspdf-autotable.

```javascript
/**
 * Generate a comprehensive weather report PDF
 */
const generateWeatherReportPDF = (currentWeather, forecast, history, city) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title and header
  doc.setFontSize(22);
  doc.setTextColor(44, 62, 80);
  doc.text(`Weather Report: ${city}`, 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
  
  // Add current weather section
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text('Current Weather Conditions', 14, 40);
  
  // Create table for current weather data
  const currentData = [
    ['Parameter', 'Value'],
    ['Temperature', `${currentWeather.data.values.temperature.toFixed(1)}°C`],
    ['Weather', simpleWeatherService.getWeatherStatus(currentWeather.data.values.weatherCode)],
    ['Humidity', `${currentWeather.data.values.humidity}%`],
    ['Wind Speed', `${currentWeather.data.values.windSpeed.toFixed(1)} km/h`],
    ['Cloud Cover', `${currentWeather.data.values.cloudCover}%`],
    ['Pressure', `${currentWeather.data.values.pressureSurfaceLevel.toFixed(0)} hPa`]
  ];
  
  // Add the table to the PDF
  autoTable(doc, {
    startY: 45,
    head: [currentData[0]],
    body: currentData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202], textColor: 255 },
    styles: { halign: 'left' },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });
  
  // Add more sections for forecast and historical data...
  
  // Return the PDF as a blob
  return doc.output('blob');
};
```

**Technical Notes:**
- Uses jsPDF for document creation and jspdf-autotable for tabular data
- Organizes data into logical sections (current, forecast, historical)
- Implements different report types (comprehensive, current, forecast, historical, custom)
- Formats dates and numerical values for better readability

## Error Handling

The application implements a comprehensive error handling system with custom error types and user-friendly error displays.

### Custom Error Types

```javascript
/**
 * Error types for better error handling
 */
const ErrorTypes = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  LOCATION_NOT_FOUND: 'LOCATION_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Custom error class for weather service errors
 */
class WeatherServiceError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = 'WeatherServiceError';
    this.type = type;
    this.originalError = originalError;
  }
}
```

### Error Display Component

```jsx
const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
  // Default values if error is not properly structured
  const errorType = error?.type || 'UNKNOWN_ERROR';
  const errorMessage = error?.message || 'An unknown error occurred';
  
  // Determine icon and action text based on error type
  let icon = '⚠️';
  let actionText = '';
  
  switch (errorType) {
    case simpleWeatherService.ErrorTypes.INVALID_API_KEY:
      icon = '🔑';
      actionText = 'Please check your API key in the .env file and restart the application.';
      break;
    case simpleWeatherService.ErrorTypes.RATE_LIMIT_EXCEEDED:
      icon = '⏱️';
      actionText = 'Please wait a moment before trying again.';
      break;
    // Additional cases...
  }
  
  return (
    <div className="error-container">
      <div className="error-icon">{icon}</div>
      <div className="error-content">
        <h3 className="error-title">{getErrorTitle(errorType)}</h3>
        <p className="error-message">{errorMessage}</p>
        <p className="error-action">{actionText}</p>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            Try Again
          </button>
        )}
        {onDismiss && (
          <button className="error-dismiss-btn" onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
```

**Technical Notes:**
- Implements a custom error class with type information
- Categorizes errors into specific types for better handling
- Provides user-friendly error messages with actionable suggestions
- Includes retry and dismiss functionality

## API Key Rotation Strategy

The application implements a sophisticated API key rotation strategy to prevent rate limiting issues when making requests to the Tomorrow.io API.

### Key Features

1. **Dedicated Keys for Different Request Types**
   - Current weather requests use VITE_TOMORROW_API_KEY1
   - Forecast requests use VITE_TOMORROW_API_KEY2
   - Historical data requests use VITE_TOMORROW_API_KEY3

2. **Automatic Fallback Mechanism**
   - If any key hits a rate limit or fails, the system automatically tries the next key
   - Each request type has its own fallback sequence
   - The system tracks failure counts for each key to optimize key selection

3. **Request Throttling**
   - Each request type has its own throttling timer
   - Enforces a minimum delay between API calls of the same type
   - Prevents hitting rate limits by spacing out requests

4. **Centralized Request Handler**
   - All API requests go through a single handler function
   - Handles key selection, throttling, and fallbacks
   - Provides consistent error handling

### Implementation Details

```javascript
// Make an API request with the current weather endpoint
getCurrentWeatherByCity: async (city) => {
  return makeApiRequest('current', '/weather/realtime', { location: city });
},

// Make an API request with the forecast endpoint
getForecastByCity: async (city) => {
  const data = await makeApiRequest('forecast', '/weather/forecast', { location: city });
  // Process and return the data...
},

// Make an API request with the historical endpoint
getHistoricalWeatherByCity: async (city, days = 7) => {
  // Calculate date ranges...
  const data = await makeApiRequest('historical', '/weather/history/recent', {
    location: city,
    startTime: startDateStr,
    endTime: endDateStr
  });
  // Process and return the data...
}
```

**Benefits:**
- Higher request capacity by using multiple API keys
- Improved reliability through automatic fallback
- Better user experience with fewer rate limit errors
- Transparent API usage tracking

## Conclusion

This technical documentation covers the key aspects of the Weather Application, focusing on its architecture, API integration, PDF generation, error handling, and API key rotation strategy. The application demonstrates modern React development practices and implements several advanced techniques for handling external API dependencies.
