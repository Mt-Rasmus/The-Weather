import React from 'react';

const Header = () => {// props gets passed in, so just destructuring it
   return (   
      <header className="header">
         <div className="content-container">
            <div className="header__content">
               <h1 className="header__title">The Weather</h1>
            </div>   
         </div>
      </header>
   )
}

export { Header as default };
