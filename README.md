# Weather App - React

A modern weather application built with React and the Tomorrow.io API. This app provides users with current weather conditions, forecasts, and other weather-related information with an intuitive and responsive user interface.

## Features

- Current weather conditions
- Hourly forecast
- Daily/weekly forecast
- Geolocation for automatic location detection
- Location search
- Responsive design

## Technologies Used

### Core
- React 19
- Vite - Fast build tool with HMR (Hot Module Replacement)

### API Integration
- **Axios** - Promise-based HTTP client for making API requests to Tomorrow.io
  - Used for fetching weather data with clean, easy-to-use syntax
  - Provides automatic JSON data transformation
  - Supports request/response interceptors
  - Offers better error handling compared to fetch

### Weather Data
- Tomorrow.io API - Provides accurate weather forecasts and current conditions

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Tomorrow.io API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Tomorrow.io API key:
   ```
   VITE_TOMORROW_API_KEY=your_api_key_here
   VITE_API_UNITS=metric
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

- `/src/services` - API services including weatherService.js for Tomorrow.io integration
- `/src/components` - React components for different parts of the UI
- `/src/utils` - Utility functions including geolocation

## Development Notes

- The app uses environment variables for API keys and configuration
- Axios is used for all API requests to Tomorrow.io
- Geolocation API is used to detect the user's current location

## License

MIT
