import React, {useEffect, useState} from 'react';

import { accountService } from '../services/auth/AuthService';
import {useNavigate} from "react-router-dom";
import Loader from "react-loader-spinner";
import TimeslotService from "../services/TimeslotService";

const Login = () => {
    let navigate = useNavigate();
    const [showSpinner,setShowSpinner]=useState(false);
    const [error,setError]=useState(null);
    useEffect(() => {
        // redirect to home if already logged in
        if (accountService.accountValue) {
            navigate('/reservation');
        }

        accountService.authenticationError.subscribe(error=>{setError(error); if(error)setShowSpinner(false)})
    }, [showSpinner]);

    const onLoginButtonClick = () => {
        setShowSpinner(true);
        accountService.login();
    }

    return (
        <div className="col-md-6 offset-md-3 mt-5 text-center">
            <div className="card">
                <h3>Prihlásenie do systému</h3>
                <p className="card-header">Pre prihlasénie do rezervačného sytému kliknite na tlačidlo "Prihlásenie cez Facebook"</p>
                <div className="card-body">
                    <button className="btn btn-facebook" onClick={()=>onLoginButtonClick()}>
                        <div style={{display: 'flex'}}>
                            {showSpinner && <Loader
                                type="TailSpin"
                                color="#00BFFF"
                                height={'30px'}
                                width={'30px'}
                            />}
                            <div style={{marginLeft: '10px'}}>
                                <i className="fa fa-facebook mr-1"></i>
                                Prihlásenie cez Facebook
                            </div>
                        </div>

                    </button>
                </div>
            </div>
        </div>
    );
}

export { Login };