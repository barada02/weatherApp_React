import { useState } from 'react'
import './App.css'
import WeatherTest from './components/WeatherTest'

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Weather App</h1>
        <p>Built with React and Tomorrow.io API</p>
      </header>
      
      <main>
        <WeatherTest />
      </main>
      
      <footer>
        <p>Note: You need to add your Tomorrow.io API key to the .env file to see weather data</p>
      </footer>
    </div>
  )
}

export default App
