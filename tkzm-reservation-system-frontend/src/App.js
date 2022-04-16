import './App.css';
import {Routes, Route, BrowserRouter, Navigate, useLocation} from "react-router-dom";
import Reservation from "./pages/Reservation";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import MyReservations from "./pages/MyReservations";
import {useEffect} from "react";
import {Amplify, Auth} from "aws-amplify";
import Welcome from "./pages/Welcome";
import {accountService} from "./services/auth/AuthService";

const App = () => {

    useEffect(() => {
        Amplify.configure({
            Auth: {
                region: process.env.REACT_APP_REGION,
                userPoolId: process.env.REACT_APP_USER_POOL_ID,
                userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
                oauth: {
                    domain: process.env.REACT_APP_COGNITO_DOMAIN,
                    scope: [
                        "email",
                        "openid",
                        "profile",
                        'aws.cognito.signin.user.admin'
                    ],
                    redirectSignIn: process.env.REACT_APP_API_URL + "/welcome",
                    redirectSignOut: process.env.REACT_APP_API_URL,
                    responseType: "code"
                },
            },
        });
    });

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<Layout/>}>
                    <Route index element={<Home/>}/>
                    <Route path="welcome" element={<RequireAuth><Welcome/></RequireAuth>}/>
                    <Route path="reservation" element={<RequireAuth><Reservation/></RequireAuth>}/>
                    <Route path="user-reservations" element={<RequireAuth><MyReservations/></RequireAuth>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

function RequireAuth({ children }) {
    let auth = accountService.accountValue;
    let location = useLocation();
    let userSignedIn = false;
    const checkIfUserAuthenticated = Auth.currentAuthenticatedUser()
        .then(account => {
            Auth.currentUserInfo().then(userInfo => {
                let username = userInfo.attributes.name ? `${userInfo.attributes.name} ${userInfo.attributes.family_name}` : userInfo.username;
                userSignedIn = true;
            }).catch(error=> console.log(error))
        });

    checkIfUserAuthenticated.then(data => {
        //console.log("Auth check finished");

    });
    // if (!auth && !userSignedIn) {
    //     // Redirect them to the /login page, but save the current location they were
    //     // trying to go to when they were redirected. This allows us to send them
    //     // along to that page after they login, which is a nicer user experience
    //     // than dropping them off on the home page.
    //     return <Navigate to="/" state={{ from: location }} replace />;
    // }

    return children;
}

export const TIMESLOT_STATES = {
    FREE: 'free',
    RESERVED: 'reserved'
}

export default App;
