import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Will implement actual search functionality later
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="home-container">
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <i className="search-icon">&#x1F50D;</i>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for a city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>
      <div className="current-weather-container">
        
      </div>
      <div className="middle-space">
        {/* Empty space between current weather and popular cities */}
      </div>
      <div className="popular-cities-container">
        <h5>Popular Cities</h5>
      </div>

      <div className="hourly-forecast-container">
        <h5>Hourly Forecast</h5>
      </div>
      
    </div>
  );
};

export default Home;
