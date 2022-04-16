import {Login} from "../components/Login";
import {accountService} from "../services/auth/AuthService";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import UserMessage from "../components/UserMessage";
import {Auth} from "aws-amplify";
import Loader from "react-loader-spinner";
import {BACKEND_BASE_URL} from "../services/Constants";
import TimeslotService from "../services/TimeslotService";


const Welcome = () => {
    let authenticationErrorSubscription;
    let accountSubscription;
    let navigate = useNavigate();
    const [account, setAccount] = useState(accountService.accountValue);
    const [error, setError] = useState(null);
    const forwardToReservation = () => {
        navigate('/reservation');
    }

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


    useEffect(() => {
        console.log(accountService.accountValue);
        authenticationErrorSubscription = accountService.authenticationError.subscribe(error => setError(error == null ? error : error.message))
        accountSubscription = accountService.account.subscribe(x => setAccount(x));
        Auth.currentAuthenticatedUser()
            .then(account => {
                Auth.currentUserInfo().then(userInfo => {
                    let username = userInfo.attributes.name ? `${userInfo.attributes.name} ${userInfo.attributes.family_name}` : userInfo.username;
                    setAccount({name: username});
                    accountService.accountSubject.next({name: username});
                    getTimetableData()
                    navigate('/welcome');
                })
            })
            .catch((error) => {
                setAccount(null);
                // console.log('Not signed in')
            });
        return () => {
            authenticationErrorSubscription.unsubscribe();
            accountSubscription.unsubscribe();
        }
    }, []);

    return (
        <>
        {account &&
        <div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <h3 className="title">Úvodná stránka</h3>
                {error &&
                <UserMessage color={'indianred'} message={`Chyba pri autentifikácii, skúste sa prihlásiť znova.`}/>}

                <p style={{marginBottom: '10px'}}>Užívatel {account.name} bol úspešne prihlásený do rezervačného systému
                    TK
                    ZLATE MORAVCE. Môžete prístúpiť k rezervácií dvorcov.</p>
                <button className={'button is-info'} onClick={forwardToReservation}>Rezervuj si dvorec</button>
            </div>
        </div>}

            {!account && <h4 className={'user-message'}><Loader
                type="TailSpin"
                color="#00BFFF"
                height={'30px'}
                width={'30px'}/>Dáta sa načítavajú</h4>
            }
        </>
    )
}

export default Welcome;