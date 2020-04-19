
import React, { useContext, useEffect, useState } from 'react';
import WeatherContext from '../context/weather-context';
import data from "../fixtures/data.json";
import moment from 'moment';

const WeatherDisplay = () => {
   
   const OpenWeatherAPI = {
      key: process.env.REACT_APP_API_KEY,
      base: "https://api.openweathermap.org/data/2.5/"
   }

   const [query, setQuery] = useState('');
   const { weather, city, setCity, setWeather } = useContext(WeatherContext);
   const devMode = true;
   
   const searchPlace = (data) => {
         console.log(data)
         let searchQuery;
         searchQuery = (data === 'inputQuery' ? query : JSON.parse(data));
            fetch(`${OpenWeatherAPI.base}weather?q=${searchQuery}&units=metric&APPID=${OpenWeatherAPI.key}`)
               .then(res => res.json())
               .then(result => {
                  if( result !== undefined && result.cod !== 429 ) {
                     setWeather(result);
                     setQuery('');
                     setCity(result.name);
                     localStorage.setItem(`city`, JSON.stringify(result.name));  
                  } else {
                  }
               })
   }

   const onSearch = e => {
      if(e.key === "Enter") {
         searchPlace('inputQuery');
      }
   }

   useEffect (() => {
      if(devMode) {
         setWeather(data);
         setCity(data.name);
         localStorage.setItem(`city`, JSON.stringify(data.name));  
      } else {
         //const storedCity = localStorage.getItem(`city${city}`);
         const storedCity = localStorage.getItem(`city`);
         if(storedCity !== null && storedCity !== "undefined") {
            //searchPlace((storedCity));  
         }
      }

   })

   return (
      <div className="content-container">
         <input 
            type="text"
            placeholder="Location..."
            className="text-input"
            onChange={e => setQuery(e.target.value)}
            value={query}
            onKeyPress={onSearch}
            >
         </input>
         { weather.name !== undefined ? (
            <div>
               <div className="center-container">
                  <p className="location">{weather.name}, {weather.sys.country}</p>
               </div>
               <div className="center-container">
                  <p className="date">{moment.utc(weather.dt*1000).format('MMMM Do YYYY, h:mm a')}</p>
               </div>
               <div className="center-container">
                  <div className="center-container">
                     <img className="icon" src={`/images/sun1.png`} alt=""/>
                     <div >
                        <p className="temperature">{Math.round(weather.main.temp - 250)}°</p>
                     </div>                    
                  </div>
                  <div className="details">
                     <h2 className="details-header">Details</h2>
                     <hr className="hr-small"></hr>
                     <div className="details details__sub">
                        <p className="details-text">Wind: </p><p className="details-text__unit">{weather.wind.speed}m/s</p>
                        <p className="details-text">Clouds: </p><p className="details-text__unit">{weather.clouds.all}%</p>
                        <p className="details-text">Humidity: </p><p className="details-text__unit">{weather.main.humidity}%</p>
                     </div>
                  </div>
                  <div><hr></hr></div>
               </div>
               <hr></hr>
               
            </div>

         ) : ('') } 

      </div>
   );
}

export { WeatherDisplay as default };