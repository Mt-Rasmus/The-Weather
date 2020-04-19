
import React, { useContext, useEffect, useState } from 'react';
import WeatherContext from '../context/weather-context';

const WeatherDisplay = () => {
   
   const OpenWeatherAPI = {
      key: process.env.REACT_APP_API_KEY,
      base: "https://api.openweathermap.org/data/2.5/"
   }

   const [query, setQuery] = useState('');
   const { weather, city, setCity, setWeather } = useContext(WeatherContext);
   
   const searchPlace = (data) => {
         let searchQuery;
         searchQuery = (data === 'inputQuery' ? query : JSON.parse(data));
            fetch(`${OpenWeatherAPI.base}weather?q=${searchQuery}&units=metric&APPID=${OpenWeatherAPI.key}`)
               .then(res => res.json())
               .then(result => {
                  if( result !== undefined ) {
                     setWeather(result);
                     setQuery('');
                     setCity(result.name);
                     localStorage.setItem(`city`, JSON.stringify(result.name));  
                  } else {
                     console.log(result);
                  }
               })
   }

   const onSearch = e => {
      if(e.key === "Enter") {
         searchPlace('inputQuery');
      }
   }

   useEffect (() => {
      const storedCity = localStorage.getItem(`city${city}`);
      if(storedCity !== null ) {
         searchPlace((storedCity));  
      }
   })

   return (
      <div>
         <input 
            type="text"
            placeholder="Location..."
            onChange={e => setQuery(e.target.value)}
            value={query}
            onKeyPress={onSearch}
            >
         </input>
         { weather.name !== undefined ? (
            <div>
               {console.log('eyyy1: ', weather)}
               <p>{weather.name}, {weather.sys.country}</p>
               <div>
                  <p>{Math.round(weather.main.temp)} °C</p>
               </div>
            </div>
         ) : ('') } 

      </div>
   );
}

export { WeatherDisplay as default };