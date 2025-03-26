import { useState } from 'react';

const Sidebar = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('home');

  const handleNavigation = (page) => {
    setActiveItem(page);
    onNavigate(page);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">Weather</div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li 
            className={activeItem === 'home' ? 'active' : ''}
            onClick={() => handleNavigation('home')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </li>
          <li 
            className={activeItem === 'current' ? 'active' : ''}
            onClick={() => handleNavigation('current')}
          >
            <span className="nav-icon">🌤️</span>
            <span className="nav-text">Current</span>
          </li>
          <li 
            className={activeItem === 'forecast' ? 'active' : ''}
            onClick={() => handleNavigation('forecast')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Forecast</span>
          </li>
          <li 
            className={activeItem === 'cities' ? 'active' : ''}
            onClick={() => handleNavigation('cities')}
          >
            <span className="nav-icon">🗺️</span>
            <span className="nav-text">Cities</span>
          </li>
          <li 
            className={activeItem === 'settings' ? 'active' : ''}
            onClick={() => handleNavigation('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <p>2025</p>
      </div>
    </div>
  );
};

export default Sidebar;
