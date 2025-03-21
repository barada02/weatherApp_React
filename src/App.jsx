import './App.css'
import SimpleWeather from './components/SimpleWeather'
import SimpleForecast from './components/SimpleForecast'

function App() {
  return (
    <div className="app-container">
      <div className="weather-section">
        <SimpleWeather />
      </div>
      <div className="forecast-section">
        <SimpleForecast />
      </div>
    </div>
  )
}

export default App
