import {BehaviorSubject} from 'rxjs';
import axios from 'axios';

import {history} from '../BrowserHistory';
import {BACKEND_BASE_URL} from "../Constants";
import {Auth} from "aws-amplify";

const baseUrl = `${process.env.REACT_APP_API_URL}/accounts`;
const accountSubject = new BehaviorSubject(null);
const errorSubject = new BehaviorSubject(null);

export const accountService = {
    login,
    apiAuthenticate,
    logout,
    accountSubject: accountSubject,
    account: accountSubject.asObservable(),
    authenticationError: errorSubject.asObservable(),
    get accountValue() {
        return accountSubject.value;
    },
    get errorValue() {
        return errorSubject.value;
    }
};

async function login() {
    // login with facebook then authenticate with the API to get a JWT auth token
    const {authResponse} = await new Promise(window.FB.login);
    if (!authResponse) return;
    await apiAuthenticate(authResponse.accessToken);

    // get return url from location state or default to home page
    const {from} = history.location.state || {from: {pathname: "/"}};
    history.push(from);
}

async function apiAuthenticate(accessToken) {
    // authenticate with the api using a facebook access token,
    // on success the api returns an account object with a JWT auth token
    errorSubject.next(null);
    const res = await fetch(`https://graph.facebook.com/v8.0/me?access_token=${accessToken}`)
    await res.json().then(data => {
            const savedBackendUser = fetch(`${BACKEND_BASE_URL}/users/save?username=${data.name}&password=`, {method: 'POST'})
                .then(res => res.json())
                .then(savedUser => {
                    let account = {
                        userId: savedUser.userId,
                        name: data.name,
                        extraInfo: `This is some extra info about ${data.name} that is saved in the API`
                    }
                    account.token = generateJwtToken(account);
                    accountSubject.next(account);
                    startAuthenticateTimer();
                    return account;
                }).catch(error => {
                    console.log(error);
                    errorSubject.next(error)
                });
        }
    ).catch(error => {
        console.log(error);
        errorSubject.next(error)
    });
}


function logout() {
    async function signOut() {
        try {
            await Auth.signOut();
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    accountSubject.next(null);
/*
    console.log('logging out.')
    // revoke app permissions to logout completely because FB.logout() doesn't remove FB cookie
    window.FB.api('/me/permissions', 'delete', null, () => window.FB.logout());
    stopAuthenticateTimer();*/

}

// helper methods

let authenticateTimeout;

function startAuthenticateTimer() {
    // parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(accountSubject.value.token.split('.')[1]));

    // set a timeout to re-authenticate with the api one minute before the token expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);


    const authResponse = window.FB.getAuthResponse();
    if (authResponse) {
        authenticateTimeout = setTimeout(() => {
            console.log("Token expired, reauthenticating");
            apiAuthenticate(authResponse.accessToken)
        }, timeout);
    } else {
        console.log("Auth - logging out as response was null")
        logout();
    }

}

function stopAuthenticateTimer() {
    // cancel timer for re-authenticating with the api
    clearTimeout(authenticateTimeout);
}

// helper functions


function unauthorized() {
    setTimeout(() => {
        const response = {status: 401, data: {message: 'Unauthorized'}};
        //  reject(response);

        // manually trigger error interceptor
        const errorInterceptor = axios.interceptors.response.handlers[0].rejected;
        errorInterceptor({response});
    }, 500);
}

function generateJwtToken(account) {
    // create token that expires in 15 minutes
    const tokenPayload = {
        exp: Math.round(new Date(Date.now() + 15 * 60 * 1000).getTime() / 1000),
        id: account.facebookId
    }
    return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
}