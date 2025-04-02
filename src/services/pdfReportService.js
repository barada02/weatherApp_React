import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import simpleWeatherService from './simpleWeatherService';

/**
 * Service for generating PDF reports from weather data
 */
const pdfReportService = {
  /**
   * Generate a comprehensive weather report PDF
   * @param {Object} currentWeather - Current weather data
   * @param {Object} forecast - Forecast data (hourly and daily)
   * @param {Object} history - Historical weather data
   * @param {string} city - City name
   * @returns {Blob} - PDF file as blob
   */
  generateWeatherReportPDF: (currentWeather, forecast, history, city) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`Weather Report: ${city}`, 105, 15, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    // Add current weather data
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Current Weather Conditions', 14, 35);
    
    const currentWeatherData = [
      ['Parameter', 'Value'],
      ['Temperature', `${currentWeather.data.values.temperature}\u00b0C`],
      ['Feels Like', `${currentWeather.data.values.temperatureApparent || '-'}\u00b0C`],
      ['Humidity', `${currentWeather.data.values.humidity}%`],
      ['Wind Speed', `${currentWeather.data.values.windSpeed} km/h`],
      ['Wind Direction', `${currentWeather.data.values.windDirection}\u00b0`],
      ['Pressure', `${currentWeather.data.values.pressureSurfaceLevel} hPa`],
      ['Weather Condition', simpleWeatherService.getWeatherStatus(currentWeather.data.values.weatherCode)],
      ['Visibility', `${currentWeather.data.values.visibility || '-'} km`],
      ['Cloud Cover', `${currentWeather.data.values.cloudCover || '-'}%`],
      ['UV Index', currentWeather.data.values.uvIndex || '-']
    ];
    
    autoTable(doc, {
      startY: 40,
      head: [currentWeatherData[0]],
      body: currentWeatherData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add hourly forecast data
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Hourly Forecast (Next 24 Hours)', 14, yPos);
    
    const hourlyData = [
      ['Time', 'Temperature (\u00b0C)', 'Weather Condition', 'Humidity (%)', 'Wind (km/h)']
    ];
    
    forecast.hourly.slice(0, 24).forEach(hour => {
      const date = new Date(hour.time);
      hourlyData.push([
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hour.temperature.toFixed(1),
        simpleWeatherService.getWeatherStatus(hour.weatherCode),
        hour.humidity ? hour.humidity.toFixed(0) : '-',
        hour.windSpeed ? hour.windSpeed.toFixed(1) : '-'
      ]);
    });
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [hourlyData[0]],
      body: hourlyData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add daily forecast data
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Daily Forecast', 14, yPos);
    
    const dailyData = [
      ['Date', 'Min Temp (\u00b0C)', 'Max Temp (\u00b0C)', 'Weather Condition', 'Precipitation']
    ];
    
    forecast.daily.forEach(day => {
      const date = new Date(day.time);
      dailyData.push([
        date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        day.temperatureMin.toFixed(1),
        day.temperatureMax.toFixed(1),
        simpleWeatherService.getWeatherStatus(day.weatherCode),
        day.precipitationProbabilityAvg ? `${day.precipitationProbabilityAvg}%` : '-'
      ]);
    });
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [dailyData[0]],
      body: dailyData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add historical data if available
    if (history && history.daily) {
      yPos = doc.lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Historical Weather (Past 7 Days)', 14, yPos);
      
      const historicalData = [
        ['Date', 'Avg Temp (\u00b0C)', 'Min Temp (\u00b0C)', 'Max Temp (\u00b0C)', 'Precipitation', 'Humidity (%)']
      ];
      
      history.daily.forEach(day => {
        const date = new Date(day.time);
        historicalData.push([
          date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          day.temperatureAvg.toFixed(1),
          day.temperatureMin.toFixed(1),
          day.temperatureMax.toFixed(1),
          day.precipitationSum ? `${day.precipitationSum.toFixed(1)} mm` : '-',
          day.humidityAvg ? day.humidityAvg.toFixed(0) : '-'
        ]);
      });
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [historicalData[0]],
        body: historicalData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
    }
    
    // Add footer
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Data provided by Tomorrow.io Weather API', 105, yPos, { align: 'center' });
    
    // Return as blob
    return doc.output('blob');
  },
  
  /**
   * Generate a custom weather report PDF with selected data
   * @param {Object} data - Weather data object containing selected data points
   * @param {string} city - City name
   * @param {Array} sections - Array of sections to include in the report
   * @returns {Blob} - PDF file as blob
   */
  generateCustomReportPDF: (data, city, sections) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`Custom Weather Report: ${city}`, 105, 15, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    let yPos = 35;
    
    // Add selected sections
    if (sections.includes('current') && data.current) {
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Current Weather Conditions', 14, yPos);
      
      const currentWeatherData = [
        ['Parameter', 'Value'],
        ['Temperature', `${data.current.temperature}\u00b0C`],
        ['Feels Like', `${data.current.temperatureApparent || '-'}\u00b0C`],
        ['Humidity', `${data.current.humidity}%`],
        ['Wind Speed', `${data.current.windSpeed} km/h`],
        ['Weather Condition', simpleWeatherService.getWeatherStatus(data.current.weatherCode)]
      ];
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [currentWeatherData[0]],
        body: currentWeatherData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    if (sections.includes('hourly') && data.hourly) {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Hourly Forecast', 14, yPos);
      
      const hourlyData = [
        ['Time', 'Temperature (\u00b0C)', 'Weather Condition']
      ];
      
      data.hourly.forEach(hour => {
        const date = new Date(hour.time);
        hourlyData.push([
          date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          hour.temperature.toFixed(1),
          simpleWeatherService.getWeatherStatus(hour.weatherCode)
        ]);
      });
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [hourlyData[0]],
        body: hourlyData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    if (sections.includes('daily') && data.daily) {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Daily Forecast', 14, yPos);
      
      const dailyData = [
        ['Date', 'Min Temp (\u00b0C)', 'Max Temp (\u00b0C)', 'Weather Condition']
      ];
      
      data.daily.forEach(day => {
        const date = new Date(day.time);
        dailyData.push([
          date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          day.temperatureMin.toFixed(1),
          day.temperatureMax.toFixed(1),
          simpleWeatherService.getWeatherStatus(day.weatherCode)
        ]);
      });
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [dailyData[0]],
        body: dailyData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Data provided by Tomorrow.io Weather API', 105, yPos, { align: 'center' });
    
    // Return as blob
    return doc.output('blob');
  },
  
  /**
   * Generate a weather comparison report PDF
   * @param {Array} citiesData - Array of city data objects
   * @returns {Blob} - PDF file as blob
   */
  generateComparisonReportPDF: (citiesData) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Weather Comparison Report', 105, 15, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    // Add current weather comparison
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Current Weather Comparison', 14, 35);
    
    const comparisonData = [
      ['City', 'Temperature (\u00b0C)', 'Weather Condition', 'Humidity (%)', 'Wind (km/h)']
    ];
    
    citiesData.forEach(city => {
      comparisonData.push([
        city.name,
        city.current.temperature.toFixed(1),
        simpleWeatherService.getWeatherStatus(city.current.weatherCode),
        city.current.humidity.toFixed(0),
        city.current.windSpeed.toFixed(1)
      ]);
    });
    
    autoTable(doc, {
      startY: 40,
      head: [comparisonData[0]],
      body: comparisonData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add forecast comparison
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('3-Day Forecast Comparison', 14, yPos);
    
    // Create a table for each day
    for (let i = 0; i < 3; i++) {
      const date = new Date(citiesData[0].daily[i].time);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text(dayStr, 14, yPos + 10);
      
      const dayData = [
        ['City', 'Min Temp (\u00b0C)', 'Max Temp (\u00b0C)', 'Weather Condition']
      ];
      
      citiesData.forEach(city => {
        dayData.push([
          city.name,
          city.daily[i].temperatureMin.toFixed(1),
          city.daily[i].temperatureMax.toFixed(1),
          simpleWeatherService.getWeatherStatus(city.daily[i].weatherCode)
        ]);
      });
      
      autoTable(doc, {
        startY: yPos + 15,
        head: [dayData[0]],
        body: dayData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // Add a new page if needed
      if (i < 2 && yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Data provided by Tomorrow.io Weather API', 105, yPos, { align: 'center' });
    
    // Return as blob
    return doc.output('blob');
  }
};

export default pdfReportService;
