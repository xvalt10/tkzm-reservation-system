import PropTypes from 'prop-types';
import TimeslotService from "../services/TimeslotService";
import {accountService as userAccountService} from "../services/auth/AuthService";
import {useEffect, useState} from "react";

const Timeslot = ({slot, onSelected}) => {
    const [text, setText] = useState("");
    const isSelectedClass = slot.selected ? 'selected' : '';
    const isColumnSticky = slot.column === 1 ? 'sticky-left' : '';
    const isReservedClass = TimeslotService.isSlotReserved(slot) ? (slot.username === userAccountService.accountValue.name ? 'my-reservation' : 'reserved') : (slot.text ? '' : 'free');

    useEffect(() => {
        determineTimeslotText(slot);
    }, [slot])

    function determineTimeslotText(slot) {
        if (slot.text) {
            setText(slot.text)
        } else {
            if (TimeslotService.isSlotReserved(slot)) {
                if (slot.username === userAccountService.accountValue.name) {
                    if (slot.description) {
                        setText(slot.description);
                    } else {
                        setText('Moja rezervácia');
                    }
                } else {
                    if (slot.description) {
                        setText(slot.description);
                    } else {
                        setText(slot.username);
                    }
                }
            } else {
                setText('Voľné');
            }
        }
    }


    return (

        <div className={`timeslot ${isSelectedClass} ${isReservedClass} ${isColumnSticky}`} style={{
            gridRowStart: slot.row, gridRowEnd: slot.row,
            gridColumnStart: slot.column, gridColumnEnd: slot.columnEnd ? slot.columnEnd : slot.column,

        }} onClick={() => {
            onSelected &&
            onSelected(slot)
        }}>
            <span>{text}</span>
        </div>
    );
}

Timeslot.propTypes = {
    slot: PropTypes.object,
};

export default Timeslot;