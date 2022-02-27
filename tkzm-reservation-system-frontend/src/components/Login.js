import React, {useEffect, useState} from 'react';
import newUserImage from '../images/new_user.png';
import existingUserImage from '../images/existing_user.png';

import {accountService} from '../services/auth/AuthService';
import {useNavigate} from "react-router-dom";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import {isMobile} from 'react-device-detect';
import Modal from 'react-modal';
import {MODAL_CUSTOM_STYLES} from "../services/Constants";
import {faWindowClose} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import UserMessage from "./UserMessage";


const Login = () => {
    let navigate = useNavigate();
    const [userMessage , setUserMessage] = useState(null);
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

    const onRegistrationSuccessful = () => {
        toggleShowSignInForm();
        setUserMessage("Registrácia používateľa bola úspešná, môžete sa prihlásiť do systému ako existujúci používateľ.");
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
            {userMessage && <UserMessage message={userMessage} color={'light-green'}/>}
            {isMobile && <Modal isOpen={showSignInForm || showSignUpForm} style={MODAL_CUSTOM_STYLES} appElement={document.getElementById('root')}>
                <FontAwesomeIcon onClick={()=>{setShowSignUpForm(false);setShowSignInForm(false)}} icon={faWindowClose} style={{marginRight:'5px',cursor:'pointer'}}/>
                {showSignInForm && <SignInForm/>}
                {showSignUpForm && <SignUpForm/>}
            </Modal>}

            {!isMobile && showSignInForm && <SignInForm/>}
            {!isMobile && showSignUpForm && <SignUpForm onRegistrationSuccessful={onRegistrationSuccessful}/>}
        </>
    );
}

export
{
    Login
}
    ;