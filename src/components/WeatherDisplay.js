
import React, { useContext, useEffect, useState, useRef } from 'react';
import WeatherContext from '../context/weather-context';
import OptionsBar from './OptionsBar';
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
            icon:  inputData.weather[0].icon,
            details: {
               wind: inputData.wind.speed,
               clouds: inputData.clouds.all,
               humidity: inputData.main.humidity
            }
         });    
      }
      else if (setType === 'forecast') {
         let nowTime = new Date().getHours();
         let element, currTimestamp, nextTimestamp;
         for(let i = 0; i < inputData.list.length; i++) {

            element = inputData.list[i];
            currTimestamp = moment.utc(element.dt*1000).hour();
            
            if(moment.utc(element.dt*1000).day() === day && Math.abs(nowTime - currTimestamp) <= 3) {
               // select the forecast element whose timestamp is closest to the current time
               nextTimestamp = moment.utc(inputData.list[i+1].dt*1000).hour();
               nextTimestamp = nextTimestamp === 0 ? 24 : nextTimestamp;
               element = (Math.abs(nowTime - nextTimestamp) < Math.abs(nowTime - currTimestamp)) 
               ? inputData.list[i+1] : element;

               setWeather({
                  temp: element.main.temp,
                  name: inputData.city.name,
                  country: inputData.city.country,
                  timestamp: element.dt,
                  icon:  element.weather[0].icon,
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
      if(!devMode) {
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
         <OptionsBar onChangeDay={onChangeDay} onSearch={onSearch} getDayString={getDayString} />
         { weather.name !== undefined ? (
            <div>
               <div className="center-container">
                  <p className="location">{weather.name}, {weather.country}</p>
               </div>
               <div className="center-container">
                  <p className="date">{`${moment.utc(weather.timestamp*1000).format('MMMM Do YYYY')} (${getDayString(day)})`}</p>
               </div>
               <div className="center-container">
                  <div className="center-container">
                     <img className="icon" src={`/images/icons/${weather.icon}.png`} alt=""/>
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