import React from 'react';
import { render } from 'react-dom';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initFacebookSdk } from './services/auth/Init-Facebook-Sdk';
import { jwtInterceptor } from './services/auth/JWT-Interceptor';
import { errorInterceptor } from './services/auth/Error-Interceptor';
import {history} from './services/BrowserHistory';
import {Router} from "react-router-dom";

// enable interceptors for http requests
jwtInterceptor();
errorInterceptor();

// wait for facebook sdk before startup
initFacebookSdk().then(startApp);

function startApp(){
    render(

            <App />,

        document.getElementById('root')
    );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
