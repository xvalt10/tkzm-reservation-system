import React, {useEffect, useState} from "react";
import {Auth} from "aws-amplify";
import Loader from "react-loader-spinner";
import {accountService} from "../services/auth/AuthService";

import UserMessage from "./UserMessage";

const SignInForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [facebookButtonSpinner, setFacebookButtonSpinner] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        // redirect to home if already logged in
        accountService.authenticationError.subscribe(error => {
            setError(error);
            if (error) setFacebookButtonSpinner(false)
        })

    }, []);


    const onFacebookLoginButtonClick = () => {
        setFacebookButtonSpinner(true);
        Auth.federatedSignIn({provider: 'Facebook'}).then(r => console.log(r)).catch(err => console.log(err));

    }
    const signIn = (e) => {
        setError(null);
        e.preventDefault();
        Auth.signIn({
            username: email,
            password,
        })
            .then((user) => {
                setEmail("");
                setPassword("");

                console.log(user);
                let account = {
                    name: user.username,
                }
                accountService.accountSubject.next(account);

            })
            .catch((err) => {
                switch (err.message) {
                    case 'Incorrect username or password.':
                        setError(`Nesprávne meno alebo heslo.`);
                        break;
                    case 'User does not exist.':
                        setError(`Užívateľ neexistuje.`);
                        break;
                    default:
                        console.log(err.message);
                        setError(`Pri prihlásení sa vyskytla chyba.`);
                }
            });
    };
    return (
        <div className={'box flex-column-container'}>
            <h3 className={'subtitle'}>Prihlásenie do rezervačného systému</h3>
            {error && <UserMessage message={error} color={'red'}/>}
        {/*    <p className={'is-spaced'}>Pre prihlasénie do rezervačného sytému zadajte vašu emailovú adresu a
                heslo alebo kliknite na tlačidlo "Prihlásenie cez Facebook"</p>*/}
            <div style={{ 'borderBottom': '1px solid black', 'paddingBottom': '0.7rem'}}>
                <div className='form-control'>
                    <button className="button is-info" onClick={() => onFacebookLoginButtonClick()}>
                        <div style={{display: 'flex'}}>
                            {facebookButtonSpinner && <Loader
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
                </div>
            </div>
            <div className="flex-row-container">
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
                        <button className="button is-rounded is-info" type="submit" onClick={signIn}>
                            Prihlásiť sa
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
};
export default SignInForm;