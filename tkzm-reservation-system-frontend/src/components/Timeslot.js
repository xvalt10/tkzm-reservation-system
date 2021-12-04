import PropTypes from 'prop-types';
import TimeslotService from "../services/TimeslotService";
import {accountService as userAccountService} from "../services/auth/AuthService";

const Timeslot = ({slot, onSelected}) => {
    const isSelectedClass = slot.selected ? 'selected' : '';
    const isReservedClass = TimeslotService.isSlotReserved(slot) ? (slot.userAccount.userId === userAccountService.accountValue.userId ? 'my-reservation':'reserved') : (slot.text ? '': 'free');
    return (

        <div className={`timeslot ${isSelectedClass} ${isReservedClass}`} style={{
            gridRowStart: slot.row, gridRowEnd: slot.row,
            gridColumnStart: slot.column, gridColumnEnd: slot.column,

        }} onClick={() => {
            onSelected(slot)
        }}>
            <span>{slot.text}{!slot.text && slot.userAccount ? (slot.userAccount.userId === userAccountService.accountValue.userId  ? 'Moja rezervácia':`Obsadené (${slot.userAccount.username})`): !slot.text ? 'Voľné':''}</span>
        </div>
    );
}

Timeslot.propTypes = {
    slot: PropTypes.object,
};

export default Timeslot;