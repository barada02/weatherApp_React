import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import AdvancedAnalysis from './components/AdvancedAnalysis'

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
    </div>
  )
}

export default App
