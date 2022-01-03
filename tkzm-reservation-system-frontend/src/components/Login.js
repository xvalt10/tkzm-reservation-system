import React, {useEffect, useState} from 'react';
import newUserImage from '../images/new_user.png';
import existingUserImage from '../images/existing_user.png';

import {accountService} from '../services/auth/AuthService';
import {useNavigate} from "react-router-dom";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

const Login = () => {
    let navigate = useNavigate();
    const [showSignUpForm, setShowSignUpForm] = useState(false);
    const [showSignInForm, setShowSignInForm] = useState(false);

    let signUpSelectedClass = showSignUpForm ? 'is-info' : '';
    let signInSelectedClass = showSignInForm ? 'is-info' : '';


    const toggleShowSignUpForm = () => {
        setShowSignUpForm(true);
        setShowSignInForm(false);
    }

    const toggleShowSignInForm = () => {
        setShowSignUpForm(false);
        setShowSignInForm(true);
    }

    useEffect(() => {
        // redirect to home if already logged in
        if (accountService.accountValue) {
            navigate('/reservation');
        }

    }, []);


    return (
        <>
            <h3 className="title">Rezervačný systém TK Zlaté Moravce</h3>
            <div className={'columns'}>


                <div data-v-23847e07="" className={`column is-flex ${signUpSelectedClass}`}>
                    <a data-v-23847e07="" onClick={toggleShowSignUpForm}
                       className="card is-rounded container">
                        <div className={'is-flex'}>
                            <img className={'user-img'} src={newUserImage} alt={'Registracia'}/>
                        </div>
                        <div className="card-content">
                            <div className="content"><p className="title is-4">Nový používateľ</p><p>
                                Prejsť na registračný formulár
                            </p></div>
                        </div>
                    </a>
                </div>

                <div data-v-23847e07="" className={`column is-flex ${signInSelectedClass}`}>
                    <a data-v-23847e07="" onClick={toggleShowSignInForm}
                       className="card is-rounded container">
                        <div className="is-flex">
                            <img className={'user-img'} src={existingUserImage} alt={'Prihlásenie'}/>
                        </div>
                        <div className="card-content">
                            <div className="content"><p className="title is-4">Existujúci používateľ</p><p>
                                Prihlásiť sa do systému
                            </p></div>
                        </div>
                    </a>
                </div>

            </div>

            {showSignInForm && <SignInForm/>}
            {showSignUpForm && <SignUpForm/>}
        </>
    );
}

export
{
    Login
}
    ;