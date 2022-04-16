import {Outlet} from "react-router-dom";
import Navbar from "../components/NavBar";
import { useLocation } from "react-router-dom";
import kurtybackgroundimage from '../images/kurty.jpg';

const Layout = () => {
    const location = useLocation();

    return (
        <div id={'main-pane'}>
            {location.pathname === '/' && <div><img src={kurtybackgroundimage} className={'bg'}/>  <div className={'centered'}>   <Outlet /></div></div>}

            {location.pathname !== '/' &&
                <>
                <Navbar/>
            <div className="container">
                <div className="box">
                    <Outlet />
                </div>
            </div></>}
        </div>
    );
}

export default Layout;