import {Login} from "../components/Login";
import {accountService} from "../services/auth/AuthService";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import UserMessage from "../components/UserMessage";
import {Auth} from "aws-amplify";
import {BACKEND_BASE_URL} from "../services/Constants";
import TimeslotService from "../services/TimeslotService";
import Loader from "react-loader-spinner";


const Home = () => {
    let authenticationErrorSubscription;
    let accountSubscription;
    let navigate = useNavigate();
    const [authenticationFinished, setAuthenticationFinished] = useState(false);
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        authenticationErrorSubscription = accountService.authenticationError.subscribe(error => setError(error == null ? error : error.message))
        accountSubscription = accountService.account.subscribe(x => setAccount(x));
        const checkIfUserAuthenticated = Auth.currentAuthenticatedUser()
            .then(account => {
                Auth.currentUserInfo().then(userInfo => {
                    let username = userInfo.attributes.name ? `${userInfo.attributes.name} ${userInfo.attributes.family_name}` : userInfo.username;
                    setAccount({name: username});
                    accountService.accountSubject.next({name: username});
                    navigate('/welcome');
                })
            })
            .catch((error) => {
                setAccount(null);
                // console.log('Not signed in')
            });
        checkIfUserAuthenticated.then(data => {
            //console.log("Auth check finished");
            setAuthenticationFinished(true)
        });
        return () => {
            authenticationErrorSubscription.unsubscribe();
            accountSubscription.unsubscribe();
        }
    }, []);

    return (
        <>
        {authenticationFinished &&
        <div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {error &&
                <UserMessage color={'indianred'} message={`Chyba pri autentifikácii, skúste sa prihlásiť znova.`}/>}
                <Login/>
            </div>
        </div>}

        </>
    )
}

export default Home;