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
    const [showSignInForm, setShowSignInForm] = useState(true);

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
            {userMessage && <UserMessage message={userMessage} color={'light-green'}/>}
            {isMobile && <Modal isOpen={showSignInForm || showSignUpForm} style={MODAL_CUSTOM_STYLES} appElement={document.getElementById('root')}>
                <div className={'scroll-component'}>
                <FontAwesomeIcon onClick={()=>{setShowSignUpForm(false);setShowSignInForm(false)}} icon={faWindowClose} style={{marginRight:'5px',cursor:'pointer'}}/>
                {showSignInForm && <SignInForm onShowRegisterForm={toggleShowSignUpForm}/>}
                {showSignUpForm && <SignUpForm onRegistrationSuccessful={onRegistrationSuccessful} onSingUpBackButton={toggleShowSignInForm}/>}
                </div>
            </Modal>}

            {!isMobile && showSignInForm && <SignInForm onShowRegisterForm={toggleShowSignUpForm}/>}
            {!isMobile && showSignUpForm && <SignUpForm onRegistrationSuccessful={onRegistrationSuccessful} onSingUpBackButton={toggleShowSignInForm}/>}
        </>
    );
}

export
{
    Login
}
    ;