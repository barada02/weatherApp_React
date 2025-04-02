# Weather App - React

A modern weather application built with React and the Tomorrow.io API. This app provides users with current weather conditions, forecasts, and other weather-related information with an intuitive and responsive user interface.

## Features

- Current weather conditions
- Hourly forecast
- Daily/weekly forecast
- Historical weather data (past 7 days)
- Advanced weather analysis with data visualization
- PDF report generation for weather data
- API usage statistics monitoring
- Geolocation for automatic location detection
- Location search with popular cities management
- Responsive design with modern UI

## Technologies Used

### Core
- React 19
- Vite - Fast build tool with HMR (Hot Module Replacement)

### API Integration
- **Axios** - Promise-based HTTP client for making API requests to Tomorrow.io
  - Used for fetching weather data with clean, easy-to-use syntax
- **Tomorrow.io API** - Weather data provider with comprehensive endpoints
  - API key rotation strategy to prevent rate limiting

### PDF Generation
- **jsPDF** - Client-side JavaScript PDF generation
- **jspdf-autotable** - Plugin for creating tables in PDFs

### Data Visualization
- **Chart.js** - Simple yet flexible JavaScript charting library
- **react-chartjs-2** - React wrapper for Chart.js

## Project Structure

```
weatherApp_React/
│
├── public/                  # Static files
│
├── src/                     # Source files
│   ├── assets/              # Images, fonts, and other static assets
│   │
│   ├── components/          # React components
│   │   ├── AdvancedAnalysis.jsx    # Weather data analysis with charts
│   │   ├── ApiUsageStats.jsx       # API request monitoring component
│   │   ├── ErrorDisplay.jsx        # Error handling component
│   │   ├── Home.jsx                # Main dashboard component
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── WeatherData.jsx         # PDF report generation component
│   │   └── *.css                   # Component-specific styles
│   │
│   ├── services/            # Service modules
│   │   ├── simpleWeatherService.js # Weather API integration with key rotation
│   │   └── pdfReportService.js     # PDF generation functionality
│   │
│   ├── utils/               # Utility functions
│   │
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application-wide styles
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
│
├── .env                     # Environment variables (API keys)
├── package.json             # Project dependencies and scripts
├── vite.config.js           # Vite configuration
├── WEATHER_APP_REPORT.md    # Project overview and documentation
└── TECHNICAL_DOCUMENTATION.md # Technical details and code explanations
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Tomorrow.io API key

### Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file in the root directory with your Tomorrow.io API keys:
   ```
   VITE_TOMORROW_API_KEY1=your_api_key_1
   VITE_TOMORROW_API_KEY2=your_api_key_2
   VITE_TOMORROW_API_KEY3=your_api_key_3
   VITE_API_UNITS=metric
   ```
4. Run the development server with `npm run dev`

## Key Features Implementation

### API Key Rotation

The application implements a sophisticated API key rotation strategy to prevent rate limiting issues when making requests to the Tomorrow.io API:

- Dedicated keys for different request types (current, forecast, historical)
- Automatic fallback mechanism if a key hits rate limits
- Request throttling to space out API calls
- Key status tracking to optimize performance

### PDF Report Generation

Users can generate and download various types of weather reports in PDF format:

- Comprehensive reports with current, forecast, and historical data
- Current weather reports with detailed metrics
- Forecast reports with hourly and daily predictions
- Historical reports showing weather trends from the past week
- Custom reports where users can select specific sections to include

## License

MIT
