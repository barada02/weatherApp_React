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
            className={activeItem === 'advanced' ? 'active' : ''}
            onClick={() => handleNavigation('advanced')}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Advanced</span>
          </li>
          <li 
            className={activeItem === 'data' ? 'active' : ''}
            onClick={() => handleNavigation('data')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Data</span>
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
