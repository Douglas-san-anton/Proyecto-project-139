import React from 'react';
import ReactDOM from 'react-dom/client';
import { io } from 'socket.io-client';

import './assets/application.scss';
import init from './init.jsx';
// import reportWebVitals from './reportWebVitals';

const app = async () => {
  const root = ReactDOM.createRoot(document.querySelector('#chat'));
  const socket = io();
  const vdom = await init(socket);
  root.render(<React.StrictMode>{vdom}</React.StrictMode>);
};

app();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
