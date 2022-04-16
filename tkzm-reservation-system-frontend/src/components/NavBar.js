import logo_small from '../images/tkzm_logo_32.png';
import logo_medium from '../images/tkzm_logo_64.png';
import logo_large from '../images/tkzm_logo3.png';
import {accountService} from "../services/auth/AuthService";
import {NavLink, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser} from '@fortawesome/free-solid-svg-icons'
import { faSignOutAlt} from '@fortawesome/free-solid-svg-icons'
import TimeslotService from "../services/TimeslotService";
import {Auth} from "aws-amplify";
const Navbar = () => {
    let reservationCountSubscription;
    let accountSubscription;
    const navigate = useNavigate();
    const [showMenuItems,setShowMenuItems] = useState(false);
    const [account, setAccount] = useState(null);
    const [myReservationsCount, setMyReservationsCount] = useState(0);
    const logout = () => {
         Auth.signOut().then(r => { accountService.accountSubject.next(null);  navigate('/'); });

    }
    const toggleMenu = () => {
        setShowMenuItems(!showMenuItems);
    }
    useEffect(() => {
        reservationCountSubscription = TimeslotService.getReservationCountObservable().subscribe(count => setMyReservationsCount(count))
        accountSubscription = accountService.account.subscribe(x => setAccount(x));
        return () => {
            reservationCountSubscription.unsubscribe();
            accountSubscription.unsubscribe();
        }
    }, []);
    return (
        <>
            <nav className="navbar is-tablet is-spaced">
                <div className="container">
                    <div className="navbar-brand"><a href="/" className="navbar-item active"><img
                        srcSet={`${logo_small} 300w, ${logo_medium} 768w, ${logo_large} 1280w`} alt="Favicon.io Logo" style={{maxWidth:'85px'}}/><span className={'title is-5'}>TK ZM - Rezervácie</span></a>
                        <div data-target="navbar" className={`navbar-burger burger ${showMenuItems?'is-active':''}`} onClick={toggleMenu}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    { account && <div id="navbar" className={`navbar-menu ${showMenuItems?'is-active':''}`}>
                        <div className="navbar-start has-text-weight-bold">
                            <NavLink to="/reservation" className="navbar-item">Rozpis</NavLink>
                            <NavLink to="/user-reservations" className="navbar-item">Moje rezervácie({myReservationsCount})</NavLink>
                        </div>

                        <div className="navbar-end">
                            <div className="navbar-item">
                                <div className="field is-grouped">
                                    <p className="control">

                                        <a className="navbar-item is-default"><FontAwesomeIcon icon={faUser} style={{marginRight:'5px'}}/>{account.name}</a>
                                    </p>
                                    <p className="control">
                                        <button onClick={logout} className="button is-default"><FontAwesomeIcon icon={faSignOutAlt} style={{marginRight:'5px'}}/> Odhlásenie</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            </nav>
        </>
    );
};
export default Navbar;