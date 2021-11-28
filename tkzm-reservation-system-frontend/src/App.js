import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import Reservation from "./pages/Reservation";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import MyReservations from "./pages/MyReservations";

function App() {


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
