import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import MainPage from './components/MainPage';

ReactDOM.render(<MainPage />, document.getElementById('root'));

serviceWorker.unregister();
