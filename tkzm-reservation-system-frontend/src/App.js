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
                    domain: 'tkzm-rezervacie.auth.us-east-1.amazoncognito.com',
                    scope: [
                        "email",
                        "openid",
                        "profile"
                    ],
                    redirectSignIn: 'https://localhost:3000',
                    redirectSignOut: 'https://localhost:3000',
                    responseType: "code"
                },
            },
        });
    });

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Home />}/>
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
