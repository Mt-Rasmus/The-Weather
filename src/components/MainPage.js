import React, { useState } from 'react';
import WeatherContext from '../context/weather-context';
import Header from './Header';
import WeatherDisplay from './WeatherDisplay';
import ForecastDisplay from './ForecastDisplay';

const MainPage = () => {

   const [city, setCity] = useState('');
   const [day, setDay] = useState(new Date().getDay());
   const [weather, setWeather] = useState({});
   const [forecast, setForecast] = useState({});
   const [fetchDone, setFetchDone] = useState(false);
   return (
      // the stuff passed down in "value" are the states we want to share INSIDE the context
      <WeatherContext.Provider 
         value={{  
            city, weather, forecast, day,
            setCity, setWeather, setForecast, setFetchDone, setDay
         }}> 
         <Header />
         <WeatherDisplay />
         { 
            fetchDone && <ForecastDisplay />
         }
      </WeatherContext.Provider>
   );
}

export { MainPage as default }