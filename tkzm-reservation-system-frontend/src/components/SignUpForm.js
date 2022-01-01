import React, { useState } from "react";
import { Auth } from "aws-amplify";
import UserMessage from "./UserMessage";
const SignUpForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [waitingForCode, setWaitingForCode] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const signUp = (e) => {
        e.preventDefault();
        setError(null);
        Auth.signUp({ username: email, password, attributes: { email } })
            .then((data) => {
                console.log(data);
                setWaitingForCode(true);
                setPassword("");
            })
            .catch((err) => {
                if(err.message.indexOf("Password did not conform with policy") !== -1 ){
                    setError(`Heslo musí mať minimálne 8 znakov a musí obsahovať minimálne jedno veľké písmeno, jedno male písmeno a jedno číslo.`);
                } else if (err.message.indexOf("Invalid email address format.")!== -1){
                    setError(`Emailová adresa je zadaná v zlom formáte.`);
                }
                else if (err.message.indexOf("User already exists")!== -1){
                    setError(`Užívateľ so zvolenou emailovou adresou už existuje.`);
                } else{
                    console.log(err.message);
                    setError(`Pri registrácií užívateľa sa vyskytla chyba: ${err.message}`);
                }
            });
    };
    const confirmSignUp = (e) => {
        e.preventDefault();
        Auth.confirmSignUp(email, code)
            .then((data) => {
                console.log(data);
                setWaitingForCode(false);
                setEmail("");
                setCode("");
            })
            .catch((err) => console.log(err));
    };
    const resendCode = () => {
        Auth.resendSignUp(email)
            .then(() => {
                console.log("code resent successfully");
            })
            .catch((e) => {
                console.log(e);
            });
    };
    return (
        <div className="box form">
            <h3 className={'subtitle'}>Registrácia užívateľa</h3>
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
                        <label>Heslo</label>
                        <input
                            id="sign-up-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                        />
                    </div>
                    <button className="button is-rounded is-info" type="submit" onClick={signUp}>
                        Zaregistrovať nového používateľa
                    </button>
                </form>
            )}
            {waitingForCode && (
                <form>
                    <div className='form-control'>
                        <label>Zadajte kód poslaný na vašu emailovú adresu</label>
                        <input
                            id="sign-up-code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="code"
                        />
                    </div>
                    <button className="button is-rounded is-info" type="submit" onClick={confirmSignUp}>
                        Potvrdiť registráciu užívateľa
                    </button>
                    <button className="button is-rounded is-info" type="button" onClick={resendCode}>
                        Znovu poslať kód
                    </button>
                </form>
            )}
        </div>
    );
};
export default SignUpForm;