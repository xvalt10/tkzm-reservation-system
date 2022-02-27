import PropTypes from 'prop-types';
import TimeslotService from "../services/TimeslotService";
import {accountService as userAccountService} from "../services/auth/AuthService";
import {useEffect} from "react";

const Timeslot = ({slot, onSelected}) => {
    const isSelectedClass = slot.selected ? 'selected' : '';
    const isColumnSticky = slot.column === 1 ? 'sticky-left' : '';
    const isReservedClass = TimeslotService.isSlotReserved(slot) ? (slot.username === userAccountService.accountValue.name ? 'my-reservation':'reserved') : (slot.text ? '': 'free');

    useEffect(() => {
        console.log("-Timeslot-");
        console.log(slot.username);
        console.log(slot);
    }, [slot])


    return (

        <div className={`timeslot ${isSelectedClass} ${isReservedClass} ${isColumnSticky}`} style={{
            gridRowStart: slot.row, gridRowEnd: slot.row,
            gridColumnStart: slot.column, gridColumnEnd: slot.columnEnd?slot.columnEnd:slot.column,

        }} onClick={() => { onSelected &&
            onSelected(slot)
        }}>
            <span>{slot.text}{!slot.text && slot.username ? (slot.username === userAccountService.accountValue.name  ? 'Moja rezervácia':`${slot.username}`): !slot.text ? 'Voľné':''}</span>
        </div>
    );
}

Timeslot.propTypes = {
    slot: PropTypes.object,
};

export default Timeslot;