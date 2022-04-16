import React, {useEffect, useState} from "react";
import {Auth} from "aws-amplify";
import {accountService} from "../services/auth/AuthService";

import UserMessage from "./UserMessage";
import {BACKEND_BASE_URL} from "../services/Constants";
import TimeslotService from "../services/TimeslotService";
import ButtonWithSpinner from "./ButtonWithSpinner";
import {useNavigate} from "react-router-dom";
import Loader from "react-loader-spinner";
import logo_small from "../images/tkzm_logo_32.png";
import logo_medium from "../images/tkzm_logo_64.png";
import logo_large from "../images/tkzm_logo3.png";

const SignInForm = ({onUserNotConfirmed, onShowRegisterForm}) => {
    let authenticationErrorSubscription;
    let navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [facebookButtonSpinner, setFacebookButtonSpinner] = useState(false);
    const [error, setError] = useState(null);
    const [signInFinished, setSignInFinished] = useState(true);


    useEffect(() => {
        // redirect to home if already logged in
        authenticationErrorSubscription = accountService.authenticationError.subscribe(error => {
            setError(error);
            if (error) setFacebookButtonSpinner(false)
        })

        return () => {
            authenticationErrorSubscription.unsubscribe();
        }

    }, []);

    const getTimetableData = async () => {
        await fetch(`${BACKEND_BASE_URL}/timeslots/user/${accountService.accountValue.name}`)
            .then(res => res.json())
            .then(timeslotsFromServer => {
                    const groupedTimeslots = TimeslotService.groupReservedTimeslots(timeslotsFromServer);
                    TimeslotService.getReservationCountValueSubject().next(TimeslotService.countTimeslots(groupedTimeslots));
                }
            ).catch(error => {
                setError(error.message);
                console.log(error)
            })
    };


    const signInViaFacebook = () => {
        setFacebookButtonSpinner(true);
        Auth.federatedSignIn({provider: 'Facebook', user: {}})
            .then(credentials => {
                console.log(credentials);
                return Auth.currentAuthenticatedUser();
            })
            .then(user => {
                    console.log(user);
                    if (user) {
                        accountService.accountSubject.next({name: user.username});
                        getTimetableData();
                    }
                }
            )
            .catch(err => {
                console.log(err);
                setError(`Pri prihlásení sa vyskytla chyba.`);
                setError(err.message);
            });

    }

    const onRegisterUserButtonClick = () => {
        onShowRegisterForm();
    }
    const signInViaForm = (e) => {
        setSignInFinished(false);
        setError(null);
        e.preventDefault();
        Auth.signIn({
            username: email,
            password,
        })
            .then((user) => {
                setSignInFinished(true);
                setEmail("");
                setPassword("");
                let username = user.attributes.name ? `${user.attributes.name} ${user.attributes.family_name}` : user.username;
                accountService.accountSubject.next({name: username});
                getTimetableData();
                navigate('/welcome');
            })
            .catch((err) => {
                setSignInFinished(true);
                switch (err.message) {
                    case 'Incorrect username or password.':
                        setError(`Nesprávne meno alebo heslo.`);
                        break;
                    case 'User does not exist.':
                        setError(`Užívateľ neexistuje.`);
                        break;
                    case 'User is not confirmed.':
                        onUserNotConfirmed();
                        break;
                    default:
                        console.log(err.message);
                        setError(`Pri prihlásení sa vyskytla chyba.:` + err.message);
                }
            });
    };
    return (
        <div className={'box flex-column-container'}>
            <a href="/" className="navbar-item active"><img
                srcSet={`${logo_small} 300w, ${logo_medium} 768w, ${logo_large} 1280w`} alt="Favicon.io Logo" style={{maxWidth:'85px'}}/><span className={'title is-5'}>TK ZM - Rezervácie</span></a>
            <h3 className={'subtitle'}>Prihlásenie do rezervačného systému</h3>
            {error && <UserMessage message={error} color={'red'}/>}
            <div style={{'borderBottom': '1px solid black', 'paddingBottom': '0.7rem'}}>
                <div className='form-control'>
                    <ButtonWithSpinner showSpinner={facebookButtonSpinner} onClickFunction={signInViaFacebook}
                                       text={'Prihlásiť sa cez Facebook'}/>
                </div>
            </div>
            <div style={{'borderBottom': '1px solid black', 'paddingBottom': '0.7rem', marginBottom:'10px'}}>
                <div className="form is-spaced">
                    <form>
                        <div className='form-control'>
                            <label>Email</label>
                            <input
                                id="sign-in-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email"
                            />
                        </div>
                        <div className='form-control'>
                            <label>Heslo</label>
                            <input
                                id="sign-in-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="password"
                            />
                        </div>
                        <ButtonWithSpinner showSpinner={!signInFinished} onClickFunction={signInViaForm}
                                           text={'Prihlásiť sa'}/>

                    </form>
                </div>

            </div>
            <div className="flex-row-container">
                <button className="button fullwidth" onClick={onRegisterUserButtonClick}>Registrácia nového používateľa
                </button>
                </div>
        </div>
    );
};
export default SignInForm;