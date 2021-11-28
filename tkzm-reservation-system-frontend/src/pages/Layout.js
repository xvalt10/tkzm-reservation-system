import {Outlet} from "react-router-dom";
import Navbar from "../components/NavBar";

const Layout = () => {

    return (
        <div className={'container'}>

            <Navbar/>

            <div className="content">
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;