import React, { useState } from 'react';
import WeatherContext from '../context/weather-context';
import Header from './Header';
import WeatherDisplay from './WeatherDisplay';
import ForecastDisplay from './ForecastDisplay';

const MainPage = () => {

   const [city, setCity] = useState('');
   const [weather, setWeather] = useState({});
   const [forecast, setForecast] = useState({});

   return (
      // the stuff passed down in "value" are the states we want to share INSIDE the context
      <WeatherContext.Provider 
         value={{  
            city, weather, forecast,
            setCity, setWeather, setForecast
         }}> 
         <Header />
         <WeatherDisplay />
         <ForecastDisplay />
      </WeatherContext.Provider>
   );
}

export { MainPage as default }