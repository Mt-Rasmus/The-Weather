
import React, { useRef, useEffect, useState, useContext } from 'react';
import { select, line, scaleLinear, scaleBand, axisBottom, area } from 'd3';
import WeatherContext from '../context/weather-context';
import moment from 'moment';

const ForecastDisplay = () => {

   const { forecast, day } = useContext(WeatherContext);
   const [forecastData, setForecastData] = useState([]);
   const [min, setMin] = useState(99); // min value on line graph
   const [max, setMax] = useState(-99); // max value on line graph
   const svgRef = useRef();
   const NrOfSamples = 8;

   // update state with forecast samples of day user has chosen
   const getForecastSamples = () => {
      let forecastDataElement = forecast.list[0];
      let samples = [];
      let tempMin = 99;
      let tempMax = -99;
      let startIndex;

      if(new Date().getDay() === day) { // if today
         startIndex = 0;
      }
      else {
         for(let i = 0; i < forecast.list.length; i++) {
            forecastDataElement = forecast.list[i];
            if(moment.utc(forecastDataElement.dt*1000).day() === day) {
               startIndex = i+1;
               break;
            }      
         }          
      }
      for(let j = startIndex; j < startIndex + NrOfSamples; j++) {
         forecastDataElement = forecast.list[j];
  
         tempMax = forecastDataElement.main.temp > tempMax ? Math.round(forecastDataElement.main.temp) : tempMax;
         tempMin = forecastDataElement.main.temp < tempMin ? Math.round(forecastDataElement.main.temp) : tempMin;

         samples.push(
         {
            temp: forecastDataElement.main.temp,
            time: forecastDataElement.dt_txt.substr(forecastDataElement.dt_txt.length-8, forecastDataElement.dt_txt.length).substr(0,5),
            icon: forecastDataElement.weather[0].icon,
            idx: j-startIndex
         } )
      }
      setForecastData(samples);
      setMin(tempMin-2);
      setMax(tempMax+2);
   }

   useEffect(() => {
      getForecastSamples();
   }, [forecast])

   // Handles setting up d3 graph and elements
   useEffect(() => {

      const svg = select(svgRef.current);
      const width = document.getElementsByClassName("svg")[0].getClientRects()[0].width;
      const height = document.getElementsByClassName("svg")[0].getClientRects()[0].height;

      const lineScaleBand = scaleBand()
      .domain(forecastData.map(sample => {return sample.time}))
      .paddingOuter(-0.55)
      .rangeRound([0,width])

      const xScale = scaleLinear()
         .domain([0, forecastData.length - 1])
         .range([0, width]); // map to value (svg pixel length)

      const yScale = scaleLinear()
         .domain([min,max]) 
         .range([height, 0]); // map to value (svg pixel height)

      const xAxis = axisBottom(lineScaleBand);

      svg
         .select('.x-axis')
         .style('transform', `translateY(${height}px)`)
         .call(xAxis);

      const line1 = line()
         .x((value, idx) => xScale(idx))
         .y(yScale); // origin of svg is top left (y-val 0)

      const area1 = area()
         .x((value, idx) => xScale(idx))
         .y0(height)
         .y1(yScale);

      if(document.getElementById("tg").childElementCount === NrOfSamples) {
         svg
         .select('.text-group')
         .selectAll('text')
         .remove();
      }

      if(document.getElementById("icons").childElementCount === NrOfSamples) {
         svg
         .select('.icon-group')
         .selectAll('image')
         .remove();
      }  
      
      // add the area under line
      svg
         .selectAll('path')
         .data([forecastData.map(forecastDataElement => Math.round(forecastDataElement.temp))])
         .attr('class', 'area')
         .style('transform', `translateY(-${height}px)`)
         .transition()
         .attr('d', area1)
         .attr('fill', '#f3e98e')
         .attr('stroke', 'none');
         
      // Add the line
      svg
         .selectAll('.line')
         .data([forecastData.map(forecastDataElement => Math.round(forecastDataElement.temp))])
         .join('path')
         .attr('class', 'line')
         .transition()
         .attr('d', line1)
         .attr('fill', 'none')
         .attr('stroke', '#f5e133')
         .attr('stroke-width', '5');
         
      // add temp string above line
      svg
         .select('.text-group')
         .raise()
         .selectAll('text')
         .data(forecastData)
         .enter()
         .append("text")
         .attr('class', 'text')
         .transition()
         .attr("x", d => d.idx*(width/(NrOfSamples-1)-1.5))
         .attr("y", d => Math.round(height-((Math.round(d.temp)-min)*height/(max-min))-12))
         .text(d => `${Math.round(d.temp)}°` );
        
      // add weather icons
      svg
         .select('.icon-group')
         .raise()
         .selectAll('image')
         .data(forecastData)
         .enter()
         .append('image')
         .attr("href", d => `/images/icons/${d.icon}.png`)
         .attr("class", "icon")
         .attr("alt", " ")
         .attr("height", "50")
         .attr("width", "50")
         .style('transform', `translateX(-${width/(NrOfSamples-1)-2.5}px)`)
         .attr("x", d => d.idx*(width/(NrOfSamples-1)))
         .attr("y", height+20) // offset icons down 

   }, [forecastData])


   return (
      <div className="content-container">
         <div id="parent" className="center-container">
            <svg ref={svgRef} className="svg">
               <g className='x-axis' />
               <g className='y-axis' />
               <g className='text-group' id="tg" />
               <g className='icon-group' id="icons"/>
            </svg>
         </div>
      </div>
   )
}

export { ForecastDisplay as default };
