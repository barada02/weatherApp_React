import { useState } from 'react'
import './App.css'
import SimpleWeather from './components/SimpleWeather'
import SimpleForecast from './components/SimpleForecast'
import Sidebar from './components/Sidebar'
import Home from './components/Home'

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
      case 'current':
        return <SimpleWeather />
      case 'forecast':
        return <SimpleForecast />
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
    </div>
  )
}

export default App
