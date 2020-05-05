
import React from 'react';

const OptionsBar = (props) => {

   const today = new Date().getDay();
   //const { setQuery, query } = useContext(WeatherContext);

   return (
      <div className="content-container">
         <input 
            type="text"
            placeholder="Location..."
            className="text-input"
            onChange={e => props.setSearchQuery(e.target.value)}
            value={props.query}
            onKeyPress={props.onSearch}
            >
         </input>
         <div>
            <select type="text" className="select text-input input-group__item " onChange={props.onChangeDay}>
               <option value={today} >Today</option>
               <option value={today + 1} >Tomorrow</option>
               <option value={today + 2} >{props.getDayString(today + 2)}</option>
               <option value={today + 3} >{props.getDayString(today + 3)}</option>
               <option value={today + 4} >{props.getDayString(today + 4)}</option>
            </select>                 
         </div>
      </div>
   )
}

export { OptionsBar as default }