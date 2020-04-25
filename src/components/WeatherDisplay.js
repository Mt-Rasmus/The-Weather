
import React, { useContext, useEffect, useState, useRef } from 'react';
import WeatherContext from '../context/weather-context';
import data from "../fixtures/weather-data3.js";
import moment from 'moment';

const WeatherDisplay = () => {
   
   const OpenWeatherAPI = {
      key: process.env.REACT_APP_API_KEY,
      base: "https://api.openweathermap.org/data/2.5/"
   }

   const isFirstRun = useRef(true);
   const [query, setQuery] = useState('');
   const today = new Date().getDay();
   const { weather, forecast, city, day,
           setWeather, setForecast, setCity, setDay, setFetchDone } 
           = useContext(WeatherContext);

   const devMode = false;
   const selectWeatherData = (inputData, setType) => {
      if(setType === 'weather') {
         setWeather({
            temp: inputData.main.temp,
            name: inputData.name,
            country: inputData.sys.country,
            timestamp: inputData.dt,
            details: {
               wind: inputData.wind.speed,
               clouds: inputData.clouds.all,
               humidity: inputData.main.humidity
            }
         });    
      }
      else if (setType === 'forecast') {
         let element;
         for(let i = 0; i < inputData.list.length; i++) {
            element = inputData.list[i];
            if(moment.utc(element.dt*1000).day() === day) { // rst
               setWeather({
                  temp: element.main.temp,
                  name: inputData.city.name,
                  country: inputData.city.country,
                  timestamp: element.dt,
                  details: {
                     wind: element.wind.speed,
                     clouds: element.clouds.all,
                     humidity: element.main.humidity
                  }
               });
               break;
            }      
         }
      }
   }

   const searchPlace = (data) => {

      let searchQuery;
      if(data === 'inputQuery') { searchQuery = query; }
      else if(data === 'dayChange') { searchQuery = city; }
      else { searchQuery = JSON.parse(data); }
      // fetch todays weather
      (day === today && searchQuery !== '') &&
      fetch(`${OpenWeatherAPI.base}weather?q=${searchQuery}&units=metric&APPID=${OpenWeatherAPI.key}`)
         .then(res => res.json())
         .then(result => {
            if( result !== undefined && result.cod < 300 ) { // 429 - excessive calls
               setQuery('');
               setCity(result.name);
               day === today && selectWeatherData(result, 'weather');
               localStorage.setItem(`city`, JSON.stringify(result.name));
            } else {
               console.log('error');
            }
         })
         
      // fetch weather forecast
      searchQuery !== '' &&
      fetch(`${OpenWeatherAPI.base}forecast?q=${searchQuery}&units=metric&APPID=${OpenWeatherAPI.key}`)
         .then(res => res.json())
         .then(result => {
            if( result !== undefined && result.cod < 300 ) {
               setForecast(result);
               day !== today && selectWeatherData(result, 'forecast');
            } else {
               console.log('error');
            }
         })         
   }

   const onSearch = e => {
      if(e.key === "Enter") {
         isFirstRun.current = false;
         setCity(query);
         searchPlace('inputQuery');
      }
   }

   useEffect (() => {
      if(devMode) {
         localStorage.setItem(`city`, JSON.stringify(data.name));  
      } else {
         //const storedCity = localStorage.getItem(`city${city}`);
         const storedCity = localStorage.getItem(`city`);
         if(storedCity !== null && storedCity !== "undefined") {
            isFirstRun.current = false;
            searchPlace((storedCity));
         }
      }
      
   } ,[])

   useEffect (() => {
      (!isFirstRun.current && Object.keys(forecast).length > 1) && setFetchDone(true);
   }, [forecast])

   useEffect (() => {
      !isFirstRun.current && searchPlace('dayChange');
   }, [day])

   const getDayString = (dayNr) => {
      dayNr = dayNr > 6 ? dayNr-7 : dayNr;
      switch(dayNr) {
         case 0: return 'Sunday';
         case 1: return 'Monday';
         case 2: return 'Tuesday';
         case 3: return 'Wednesday';
         case 4: return 'Thursday';
         case 5: return 'Friday'; 
         case 6: return 'Saturday'; 
         default: return 'Error'; 
      }
   }

   const onChangeDay = e => {
      let pickedDay = Number(e.target.value);
      pickedDay = pickedDay > 6 ? pickedDay-7 : pickedDay;
      setDay(pickedDay);
   }

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
         <div>
            <select type="text" className="select input-group__item" onChange={onChangeDay}>
               <option value={today} >Today</option>
               <option value={today + 1} >Tomorrow</option>
               <option value={today + 2} >{getDayString(today + 2)}</option>
               <option value={today + 3} >{getDayString(today + 3)}</option>
               <option value={today + 4} >{getDayString(today + 4)}</option>
            </select>                 
         </div>
         { weather.name !== undefined ? (
            <div>
               <div className="center-container">
                  <p className="location">{weather.name}, {weather.country}</p>
               </div>
               <div className="center-container">
                  <p className="date">{moment.utc(weather.timestamp*1000).format('MMMM Do YYYY')}</p>
               </div>
               <div className="center-container">
                  <div className="center-container">
                     <img className="icon" src={`/images/sun1.png`} alt=""/>
                     <div >
                        <p className="temperature">{Math.round(weather.temp)}°</p>
                     </div>                    
                  </div>
                  <div className="details">
                     <h2 className="details-header">Details</h2>
                     <hr className="hr-small"></hr>
                     <div className="details details__sub">
                        <p className="details-text">Wind: </p><p className="details-text__unit">{weather.details.wind}m/s</p>
                        <p className="details-text">Clouds: </p><p className="details-text__unit">{weather.details.clouds}%</p>
                        <p className="details-text">Humidity: </p><p className="details-text__unit">{weather.details.humidity}%</p>
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