import {BehaviorSubject} from 'rxjs';
import axios from 'axios';

import {history} from '../BrowserHistory';
import {BACKEND_BASE_URL} from "../Constants";
import {Auth} from "aws-amplify";

const baseUrl = `${process.env.REACT_APP_API_URL}/accounts`;
const accountSubject = new BehaviorSubject(null);
const errorSubject = new BehaviorSubject(null);

export const accountService = {

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


function logout() {
    async function signOut() {
        try {
            await Auth.signOut();
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }
    accountSubject.next(null);
}

