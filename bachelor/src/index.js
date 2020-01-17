import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import BachelorRequest from './components/wikipedia_api/httpRequest';
import * as serviceWorker from './serviceWorker';

serviceWorker.unregister();

ReactDOM.render(
    <BachelorRequest />,
    document.getElementById('root')
);