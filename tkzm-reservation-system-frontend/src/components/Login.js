import React, {useEffect, useState} from 'react';

import { accountService } from '../services/auth/AuthService';
import {useNavigate} from "react-router-dom";
import Loader from "react-loader-spinner";

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
        <>

                <h3 className="title">Rezervačný systém TK Zlaté Moravce</h3>
                <p style={{marginBottom:'10px'}}>Pre prihlasénie do rezervačného sytému kliknite na tlačidlo "Prihlásenie cez Facebook"</p>

                    <button className="button is-info" onClick={()=>onLoginButtonClick()}>
                        <div style={{display: 'flex'}}>
                            {showSpinner && <Loader
                                type="TailSpin"
                                color="#00BFFF"
                                height={'20px'}
                                width={'20px'}
                            />}
                            <div style={{marginLeft: '10px'}}>
                                Prihlásenie cez Facebook
                            </div>
                        </div>

                    </button>


        </>
    );
}

export { Login };