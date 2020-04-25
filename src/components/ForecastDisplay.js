
import React, { useRef, useEffect, useState, useContext } from 'react';
import { select, line, scaleLinear, scaleBand, axisBottom, area } from 'd3';
import WeatherContext from '../context/weather-context';
import moment from 'moment';

const ForecastDisplay = () => {

   const { forecast, day } = useContext(WeatherContext);
   const [data, setData] = useState([]);
   const [min, setMin] = useState(99);
   const [max, setMax] = useState(-99);
   const svgRef = useRef();
   const NrOfSamples = 8;

   // update state with forecast samples of day user has chosen
   const getForecastSamples = () => {
      let element = forecast.list[0];
      let samples = [];
      let fMin = min;
      let fMax = max;
      let startIndex;

      if(new Date().getDay() === day) { // if today
         startIndex = 0;
      }
      else {
         for(let i = 0; i < forecast.list.length; i++) {
            element = forecast.list[i];
            if(moment.utc(element.dt*1000).day() === day) {
               startIndex = i+1;
               break;
            }      
         }          
      }
      for(let j = startIndex; j < startIndex + NrOfSamples; j++) {
         element = forecast.list[j];
  
         fMax = element.main.temp > fMax ? Math.round(element.main.temp) : fMax;
         fMin = element.main.temp < fMin ? Math.round(element.main.temp) : fMin;

         samples.push(
         {
            temp: element.main.temp,
            time: element.dt_txt.substr(element.dt_txt.length-8, element.dt_txt.length).substr(0,5),
            description: element.weather[0].description,
            idx: j-startIndex
         } )
      }
      setData(samples);
      setMin(fMin-2);
      setMax(fMax+2);
   }

   useEffect(() => {
      getForecastSamples();
   }, [forecast])

   useEffect(() => {
      const svg = select(svgRef.current);
      const width = document.getElementsByClassName("svg")[0].getClientRects()[0].width;
      const height = document.getElementsByClassName("svg")[0].getClientRects()[0].height;

      const lineScaleBand = scaleBand()
      .domain(data.map(sample => {return sample.time}))
      .paddingInner(1.25)
      .rangeRound([0,width])

      const xScale = scaleLinear()
         .domain([0, data.length - 1])
         .range([0, width]); // map to value (svg pixel length)

      const yScale = scaleLinear()
         .domain([min,max]) 
         .range([height, 0]); // map to value (svg pixel height)

      const xAxis = axisBottom(lineScaleBand);

      svg
         .select('.x-axis')
         .style('transform', 'translateY(150px)')
         .call(xAxis);

      // const yAxis = axisLeft(yScale);
      // svg
      // .select('.y-axis')
      // .call(yAxis);

      const myLine = line()
         .x((value, idx) => xScale(idx))
         .y(yScale); // origin of svg is top left (y-val 0)

      const area1 = area()
         .x((value, idx) => xScale(idx))
         .y0(150)
         .y1(yScale);

      if(document.getElementById("tg").childElementCount === NrOfSamples) {
         svg
         .select('.text-group')
         .selectAll('text')
         .remove();
      }

      // add the area under line
      svg
         .selectAll('path')
         .data([data.map(element => Math.round(element.temp))])
         .attr('class', 'area')
         .style('transform', 'translateY(-150px)')
         .transition()
         .attr('d', area1)
         .attr('fill', '#f3e98e')
         .attr('stroke', 'none');
         
      // Add the line
      svg
         .selectAll('.line')
         .data([data.map(element => Math.round(element.temp))])
         .join('path')
         .attr('class', 'line')
         .transition()
         .attr('d', myLine)
         .attr('fill', 'none')
         .attr('stroke', '#f5e133')
         .attr('stroke-width', '5')
         
      // add temp string above line
      svg
         .select('.text-group')
         .selectAll('text')
         .data(data)
         .enter()
         .append("text")
         .attr('class', 'text')
         .transition()
         .attr("x", d => d.idx*(width/(NrOfSamples-1)-1.5))
         .attr("y", d => Math.round(150-((Math.round(d.temp)-min)*height/(max-min))-12))
         .text(d => `${Math.round(d.temp)}°` );

   }, [data])


   return (
      <div className="content-container">
         <div id="parent" className="center-container">
            <svg ref={svgRef} className="svg">
               <g className='x-axis' />
               <g className='y-axis' />
               <g className='text-group' id="tg" />
            </svg>
         </div>
      </div>
   )
}

export { ForecastDisplay as default };
