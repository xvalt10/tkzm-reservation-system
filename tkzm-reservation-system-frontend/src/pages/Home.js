import {Login} from "../components/Login";
import {accountService} from "../services/auth/AuthService";
import {NavBtn, NavBtnLink} from "../components/NavBarElements";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import UserMessage from "../components/UserMessage";

const Home = () => {
    let navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);
    const forwardToReservation = () => {
        navigate('/reservation');
    }
    useEffect(() => {
        accountService.authenticationError.subscribe(error=>setError(error))
        accountService.account.subscribe(x => setAccount(x));
    }, []);

    return (
        <div >
            <div style={{display: 'flex', flexDirection: 'column'}}>
                {account && <h3>Úvodná stránka</h3>}
                {error && <UserMessage color={'indianred'} message={`Chyba pri autentifikácii, skúste sa prihlásiť znova.`}/>}
                {account &&
                <p>Užívatel {account.name} bol úspešne prihlásený do rezervačného systému TK ZLATE MORAVCE. Môžete prístúpiť k rezervácií dvorcov.</p>
                }
                {account ?
                <button className={'btn'} style={{alignSelf:'center'}} onClick={forwardToReservation}>Rezervuj si dvorec</button> :
                    <Login/>
                }

            </div>
        </div>
    );
}

export default Home;