import React, {useState} from "react";

const UserConfirmationForm = ({confirmSignUp, resendCode}) => {

    const [code, setCode] = useState("");

    return (
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
                    <button className="button is-rounded is-info" type="submit" onClick={(e)=>confirmSignUp(e,code)}>
                        Potvrdiť registráciu užívateľa
                    </button>
                    <button className="button is-rounded is-info" type="button" onClick={resendCode}>
                        Znovu poslať kód
                    </button>
                </form>
            );

};
export default UserConfirmationForm;