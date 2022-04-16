import React, {useState} from "react";
import {Auth} from "aws-amplify";
import UserMessage from "./UserMessage";
import UserConfirmationForm from "./UserConfirmationForm";
import Loader from "react-loader-spinner";
import logo_small from "../images/tkzm_logo_32.png";
import logo_medium from "../images/tkzm_logo_64.png";
import logo_large from "../images/tkzm_logo3.png";

const SignUpForm = ({onRegistrationSuccessful, onSingUpBackButton}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [showSendCodeButton, setShowSendCodeButton] = useState(false);
    const [showUserRegistrationSpinner, setShowUserRegistrationSpinner] = useState(false);
    const [confirmationPassword, setConfirmationPassword] = useState("");
    const [waitingForCode, setWaitingForCode] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const signUp = (e) => {
        e.preventDefault();
        setShowSendCodeButton(false);
        setShowUserRegistrationSpinner(true);
        if (passwordsMatch()) {
            setError(null);
            Auth.signUp({username: email, password, attributes: {email, name: firstname, family_name: lastname}})
                .then((data) => {
                    console.log(data);
                    setWaitingForCode(true);
                    setFirstname("");
                    setLastname("");
                    setPassword("");
                    setConfirmationPassword("");
                    setShowUserRegistrationSpinner(false);

                })
                .catch((err) => {
                    if (err.message.indexOf("Password did not conform with policy") !== -1) {
                        setError(`Heslo musí mať minimálne 8 znakov a musí obsahovať minimálne jedno veľké písmeno, jedno male písmeno a jedno číslo.`);
                    } else if (err.message.indexOf("Invalid email address format.") !== -1) {
                        setError(`Emailová adresa je zadaná v zlom formáte.`);
                    } else if (err.message.indexOf("An account with the given email already exists.")  !== -1) {
                        setWaitingForCode(false);
                        setShowSendCodeButton(true);
                        setError(`Užívateľ so zvolenou emailovou adresou už existuje.Ak je daný email váš a chcete dokončiť registráciu, stlačte tlačídlo "Zaslať verifikačný kód."`);
                    } else {
                        console.log(err.message);
                        setError(`Pri registrácií užívateľa sa vyskytla chyba: ${err.message}`);
                    }
                    setShowUserRegistrationSpinner(false);
                });
        }

    };

    const confirmSignUp = (e, code) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        Auth.confirmSignUp(email, code)
            .then((data) => {
                console.log(data);
                setWaitingForCode(false);
                setEmail("");
                setCode("");
                onRegistrationSuccessful();

            })
            .catch((err) => {
                console.log(err);
                if (err.message === 'Invalid verification code provided, please try again.') {
                    setError("Zadaný verifikačný kód je nesprávny.");
                } else {
                    setError(err.message);
                }
            });
    };
    const resendCode = () => {
        setError(null);
        setInfo(null);
        Auth.resendSignUp(email)
            .then(() => {
                setInfo(`Kód bol úspešne poslaný na vašu emailovú adresu ${email}.`);
                console.log("code resent successfully");
            })
            .catch((e) => {
                setError("Poslanie kódu nebolo úspešné:" + e.message);
                console.log(e);
            });
    };

    const displayVerificationCodeForm = () => {
        setWaitingForCode(true);
        setError(null);
    }

    const onBackButtonClicked = () => {
        onSingUpBackButton();
    }

    const passwordsMatch = () => {
        return password === confirmationPassword;
    };

    const comparePasswords = () => {
        if (!passwordsMatch()) {
            setError("Heslá ktoré ste zadali sa nezhodujú.")
        } else {
            setError(null);
        }
    };
    return (
        <div className="box form">
            <a href="/" className="navbar-item active"><img
                srcSet={`${logo_small} 300w, ${logo_medium} 768w, ${logo_large} 1280w`} alt="Favicon.io Logo" style={{maxWidth:'85px'}}/><span className={'title is-5'}>TK ZM - Rezervácie</span></a>
            <h3 className={'subtitle'}>Registrácia užívateľa</h3>
            {info && <UserMessage message={info} color={'light-green'}/>}
            {error && <UserMessage message={error} color={'red'}/>}
            {!waitingForCode && (
                <form>
                    <div className='form-control'>
                        <label>Emailová adresa</label>
                        <input
                            id="sign-up-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email"/>

                    </div>
                    <div className='form-control'>
                        <label>Meno</label>
                        <input
                            id="sign-up-first-name"
                            type="text"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            placeholder="meno"/>

                    </div>
                    <div className='form-control'>
                        <label>Priezvisko</label>
                        <input
                            id="sign-up-last-name"
                            type="text"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            placeholder="priezvisko"/>

                    </div>
                    <div className='form-control'>
                        <label>Heslo</label>
                        <input
                            id="sign-up-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                        />
                    </div>
                    <div className='form-control'>
                        <label>Potvrď heslo</label>
                        <input
                            id="sign-up-confirm-password"
                            type="password"
                            value={confirmationPassword}
                            onChange={(e) => setConfirmationPassword(e.target.value)}
                            onBlur={comparePasswords}
                            placeholder="password"
                        />
                    </div>
                    <div>
                        <button className="button is-info fullwidth" type="submit" onClick={signUp}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                {showUserRegistrationSpinner && <Loader
                                    type="TailSpin"
                                    color="#00BFFF"
                                    height={'30px'}
                                    width={'30px'}
                                />}
                                <div style={{marginLeft: '10px'}}>Zaregistrovať nového používateľa</div>
                            </div>

                        </button>
                            <button className="button fullwidth" onClick={onBackButtonClicked}>Naspät</button>

                    </div>



                    {showSendCodeButton && <button className="button is-info" onClick={displayVerificationCodeForm}>Zaslať verifikačný kód</button>}
                </form>
            )}
            {waitingForCode &&
            <UserConfirmationForm confirmSignUp={confirmSignUp} resendCode={resendCode}/>
            }
        </div>
    );
}
export default SignUpForm;