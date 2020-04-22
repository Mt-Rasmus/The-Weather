
import React, { useRef, useEffect, useState } from 'react';
import { select, line, scaleLinear, axisBottom, axisLeft } from 'd3';

const ForecastLineChart = () => {

   const [data, setData] = useState([0, 25, 30, 45, 15, 20, 0]);
   const svgRef = useRef();

   useEffect(() => {
      const svg = select(svgRef.current);

      const xScale = scaleLinear()
         .domain([0, data.length - 1])
         .range([0, 300]); // map to value (svg pixel length)

      const yScale = scaleLinear()
         .domain([0,50]) 
         .range([150, 0]); // map to value (svg pixel height)

      const xAxis = axisBottom(xScale).ticks(data.length);
      svg
         .select('.x-axis')
         .style('transform', 'translateY(150px)')
         .call(xAxis);

      const yAxis = axisLeft(yScale);
      svg
      .select('.y-axis')
      .call(yAxis);

      const myLine = line()
         .x((value, idx) => xScale(idx))
         .y(yScale); // origin of svg is top left (y-val 0)
      svg
         .selectAll('.line')
         .data([data])
         .join('path')
         .attr('class', 'line')
         .transition()
         .attr('d', myLine)
         .attr('fill', 'yellow')
         .attr('stroke', 'blue')
   }, [data])

   return (
      <div className="content-container">
         <p>Forecast</p>
         <svg ref={svgRef}>
            <g className='x-axis' />
            <g className='y-axis' />
         </svg>
         <button onClick={() => setData(data.map(value => value * 0.8))}></button>
      </div>
   )
}

export { ForecastLineChart as default };
