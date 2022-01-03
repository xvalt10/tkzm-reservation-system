import PropTypes from 'prop-types';
import TimeslotService from "../services/TimeslotService";
import {accountService as userAccountService} from "../services/auth/AuthService";

const Timeslot = ({slot, onSelected}) => {
    const isSelectedClass = slot.selected ? 'selected' : '';
    const isColumnSticky = slot.column == 1 ? 'sticky-left' : '';
    const isReservedClass = TimeslotService.isSlotReserved(slot) ? (slot.username === userAccountService.accountValue.name ? 'my-reservation':'reserved') : (slot.text ? '': 'free');
    return (

        <div className={`timeslot ${isSelectedClass} ${isReservedClass} ${isColumnSticky}`} style={{
            gridRowStart: slot.row, gridRowEnd: slot.row,
            gridColumnStart: slot.column, gridColumnEnd: slot.column,

        }} onClick={() => { onSelected &&
            onSelected(slot)
        }}>
            <span>{slot.text}{!slot.text && slot.username ? (slot.username === userAccountService.accountValue.name  ? 'Moja rezervácia':`Obsadené (${slot.username})`): !slot.text ? 'Voľné':''}</span>
        </div>
    );
}

Timeslot.propTypes = {
    slot: PropTypes.object,
};

export default Timeslot;