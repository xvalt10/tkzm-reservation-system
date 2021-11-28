import PropTypes from 'prop-types';
import {TIMESLOT_STATES} from "../App";
import TimeslotService from "../services/TimeslotService";

const Timeslot = ({slot, onSelected}) => {
    const startDate = new Date(slot.startTime);
    const endDate = new Date(slot.endTime);
    const isSelectedClass = slot.selected ? 'selected' : '';
    const isReservedClass = TimeslotService.isSlotReserved(slot) ? 'reserved' : slot.text?'': 'free';
    return (

        <div className={`timeslot ${isSelectedClass} ${isReservedClass}`} style={{
            gridRowStart: slot.row, gridRowEnd: slot.row,
            gridColumnStart: slot.column, gridColumnEnd: slot.column,

        }} onClick={() => {
            onSelected(slot)
        }}>
            <span>{slot.text ? slot.text : slot.userAccount ? `Obsadené (${slot.userAccount.username})` : 'Rezervuj'}</span>
        </div>
    );
}

Timeslot.propTypes = {
    slot: PropTypes.object,
};

export default Timeslot;