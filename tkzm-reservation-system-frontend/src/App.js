import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import Reservation from "./pages/Reservation";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import MyReservations from "./pages/MyReservations";
import {useEffect} from "react";
import {Amplify} from "aws-amplify";

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
                    redirectSignIn: process.env.REACT_APP_API_URL,
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
                    <Route path="reservation" element={<Reservation/>}/>
                    <Route path="user-reservations" element={<MyReservations/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export const TIMESLOT_STATES = {
    FREE: 'free',
    RESERVED: 'reserved'
}

export default App;
