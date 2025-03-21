/**
 * Utility functions for handling geolocation
 */

/**
 * Get the user's current position using the browser's Geolocation API
 * @returns {Promise} Promise that resolves with coordinates {latitude, longitude}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Get a location name from coordinates using reverse geocoding
 * Note: This is a placeholder. You'll need to implement this with a geocoding service
 * like OpenCage, Google Maps, or MapBox.
 * 
 * @param {number} latitude - The latitude coordinate
 * @param {number} longitude - The longitude coordinate
 * @returns {Promise} Promise that resolves with location name
 */
export const getLocationNameFromCoords = async (latitude, longitude) => {
  // This is a placeholder - you would need to implement with an actual geocoding service
  console.warn('Reverse geocoding not implemented');
  return 'Unknown Location';
};
