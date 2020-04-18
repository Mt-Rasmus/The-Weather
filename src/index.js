import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import MainPage from './components/MainPage';

// require('dotenv').config();

//console.log(process.env);

ReactDOM.render(<MainPage />, document.getElementById('root'));

serviceWorker.unregister();
