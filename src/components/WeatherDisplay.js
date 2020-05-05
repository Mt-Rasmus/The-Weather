
import React, { useContext, useEffect, useState, useRef } from 'react';
import WeatherContext from '../context/weather-context';
import OptionsBar from './OptionsBar';
import moment from 'moment';

const WeatherDisplay = () => {
   
   // setting up API connection parameters for weather/forecast data
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

   // Select current weather data (today selected)
   const selectWeatherData = weatherData => {
      setWeather({
         temp: weatherData.main.temp,
         name: weatherData.name,
         country: weatherData.sys.country,
         timestamp: weatherData.dt,
         icon:  weatherData.weather[0].icon,
         details: {
            wind: weatherData.wind.speed,
            clouds: weatherData.clouds.all,
            humidity: weatherData.main.humidity
         }
      });    
   }

   // Select current weather data from forecast data (today not selected)
   const selectWeatherDataForecast = weatherData => {
      const nowTime = new Date().getHours();
      const timeBetweenSamples = 3;
      const hoursInADay = 24;
      let weatherDataElement, currTimestamp, nextTimestamp;

      for(let i = 0; i < weatherData.list.length; i++) {

         weatherDataElement = weatherData.list[i];
         currTimestamp = moment.utc(weatherDataElement.dt*1000).hour();
         
         if(moment.utc(weatherDataElement.dt*1000).day() === day && Math.abs(nowTime - currTimestamp) <= timeBetweenSamples) {
            // select the forecast weatherDataElement whose timestamp is closest to the current time
            nextTimestamp = moment.utc(weatherData.list[i+1].dt*1000).hour();
            nextTimestamp = nextTimestamp === 0 ? hoursInADay : nextTimestamp;
            weatherDataElement = (Math.abs(nowTime - nextTimestamp) < Math.abs(nowTime - currTimestamp)) 
            ? weatherData.list[i+1] : weatherDataElement;

            setWeather({
               temp: weatherDataElement.main.temp,
               name: weatherData.city.name,
               country: weatherData.city.country,
               timestamp: weatherDataElement.dt,
               icon:  weatherDataElement.weather[0].icon,
               details: {
                  wind: weatherDataElement.wind.speed,
                  clouds: weatherDataElement.clouds.all,
                  humidity: weatherDataElement.main.humidity
               }
            });
            break;
         }      
      }      
   }

   const searchPlace = (inputString) => {

      let searchQuery;
      const failThreshold = 299;
      if (!inputString) return;
      if (inputString === 'inputQuery') { searchQuery = query; } // new search query
      else if (inputString === 'dayChange') { searchQuery = city; } // new day selected (same city)
      else { searchQuery = JSON.parse(inputString); } // city stored in local storage

      // fetch todays weather
      (day === today && searchQuery !== '') &&
      fetch(`${OpenWeatherAPI.base}weather?q=${searchQuery}&units=metric&APPID=${OpenWeatherAPI.key}`)
         .then(response => response.json() ) 
         .then(result => {
            if( result !== undefined && result.cod < failThreshold ) { // cod below 299 is failed
               setQuery('');
               setCity(result.name);
               day === today && selectWeatherData(result);
               localStorage.setItem('city', JSON.stringify(result.name));
            } else {
               console.log(`error code ${result.cod}`);
            }
         })
         
      // fetch weather forecast
      searchQuery !== '' &&
      fetch(`${OpenWeatherAPI.base}forecast?q=${searchQuery}&units=metric&APPID=${OpenWeatherAPI.key}`)
         .then(response => response.json())
         .then(result => {
            if( result !== undefined && result.cod < failThreshold ) { // cod below 299 is failed
               setForecast(result);
               day !== today && selectWeatherDataForecast(result);
            } else {
               console.log(`error code ${result.cod}`);
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

   // if for city present in local storage (last city searched in last session)
   // set weather data accordingly
   useEffect (() => {
      const storedCity = localStorage.getItem('city');
      if(storedCity !== null && storedCity !== "undefined") {
         isFirstRun.current = false;
         searchPlace((storedCity));
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

   const setSearchQuery = inQuery => {
      setQuery(inQuery);
   }

   return (
      <div className="content-container">
         <OptionsBar 
            onChangeDay={onChangeDay} 
            onSearch={onSearch} 
            getDayString={getDayString} 
            setSearchQuery={setSearchQuery}
            query={query}
         />
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