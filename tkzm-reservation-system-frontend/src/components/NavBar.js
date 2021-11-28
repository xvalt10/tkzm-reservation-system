import {
    Nav,
    NavLogo,
    NavLink,
    Bars,
    NavMenu,
    NavBtn,
    NavBtnLink,
} from "./NavBarElements";
import logo from '../images/tkzm_logo3.png';
import {accountService} from "../services/auth/AuthService";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const logout = () => {
        accountService.logout();
        navigate("/");
    }
    const navigateTo = (path) => {
        navigate(path);
    }
    useEffect(() => {
        accountService.account.subscribe(x => setAccount(x));
    }, []);
    return (
        <>
            <Nav>
                <NavLogo to="/">

                    <img src={logo} style={{width: '80px', height: '80px', padding: '5px'}}/>

                        <h3 style={{margin: 'auto'}}>TK Zlaté Moravce - Rezervačný systém</h3>

                </NavLogo>

                <Bars/>
                {account &&
                <NavMenu>
                    <NavBtn>
                        <button className={'btn'} onClick={()=>navigateTo("/user-reservations")}>Moje rezervácie</button>
                    </NavBtn>
                    <NavBtn>
                        <button className={'btn'} onClick={()=>navigateTo("/reservation")}>Rozpis</button>
                    </NavBtn>
                    <NavBtn>
                        <button className={'btn'} onClick={logout}>Odhlás sa</button>
                    </NavBtn>

                </NavMenu>}
            </Nav>
        </>
    );
};
export default Navbar;