import {Outlet} from "react-router-dom";
import Navbar from "../components/NavBar";

const Layout = () => {

    return (
        <div >

            <Navbar/>

            <div className="container">
                <div className="box">
                <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Layout;