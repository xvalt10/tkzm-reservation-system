import {Login} from "../components/Login";
import {accountService} from "../services/auth/AuthService";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import UserMessage from "../components/UserMessage";
import {Auth} from "aws-amplify";
import {BACKEND_BASE_URL} from "../services/Constants";
import TimeslotService from "../services/TimeslotService";


const Home = () => {
    let navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);
    const forwardToReservation = () => {
        navigate('/reservation');
    }

    const getTimetableData = async () => {
        await fetch(`${BACKEND_BASE_URL}/timeslots/user/${accountService.accountValue.name}`)
            .then(res => res.json())
            .then(timeslotsFromServer => {
                    const groupedTimeslots = TimeslotService.groupReservedTimeslots(timeslotsFromServer);
                    TimeslotService.getReservationCountValueSubject().next(TimeslotService.countGroupedTimeslots(groupedTimeslots));
                }
            ).catch(error => {
                setError(error.message);
                console.log(error)
            })
    };

    useEffect(() => {
        accountService.authenticationError.subscribe(error => setError(error == null ? error : error.message))
        accountService.account.subscribe(x => setAccount(x));
        Auth.currentAuthenticatedUser()
            .then(account => {
                console.log(account);
                setAccount({name: account.username});
                accountService.accountSubject.next({name: account.username});
                getTimetableData()
            })
            .catch((error) => {
                setAccount(null);
                console.log('Not signed in')
            });
    }, []);

    return (
        <div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {account && <h3 className="title">Úvodná stránka</h3>}
                {error &&
                <UserMessage color={'indianred'} message={`Chyba pri autentifikácii, skúste sa prihlásiť znova.`}/>}
                {account &&
                <p style={{marginBottom: '10px'}}>Užívatel {account.name} bol úspešne prihlásený do rezervačného systému
                    TK
                    ZLATE MORAVCE. Môžete prístúpiť k rezervácií dvorcov.</p>
                }
                {account ?
                    <button className={'button is-info'} onClick={forwardToReservation}>Rezervuj si dvorec</button> :
                    <Login/>
                }

            </div>
        </div>
    )
}

export default Home;