import PropTypes from 'prop-types';
import Timeslot from "./Timeslot";
import TimeslotService from "../services/TimeslotService";
import {useEffect} from "react";
import React from "react";

const Timetable = ({timeslots, onSelected, reservedslots}) => {
    const rowCount = timeslots && Object.keys(timeslots).length !== 0 ? Object.keys(timeslots).length + 1 : 0;
    const columnCount = timeslots && Object.keys(timeslots).length !== 0 ? timeslots[Object.keys(timeslots)[0]].length + 1 : 0

    useEffect(() => {
        //
        //     console.log("-Timetable-");
        //     console.log(reservedslots);
        // console.log(timeslots);

    }, [reservedslots])
    return (
        Object.keys(timeslots).length > 0 &&
        <div style={{
            display: 'grid',
            overflowX: 'scroll',
            padding:'1px',
            marginBottom:'10px',
            gridTemplateColumns: `repeat(${columnCount})`,
            gridTemplateRows: `repeat(${rowCount})`,

        }}>
            <Timeslot key={'topleft'} slot={{row: 1, column: 1, text: ` `}}/>
            {Object.keys(timeslots).map((courtNo, rowIndex) => {
                return <Timeslot key={'time_row' + rowIndex+courtNo} slot={{row: rowIndex + 2, column: 1, text: `Kurt ${courtNo}`}}/>
            })}


            {timeslots[Object.keys(timeslots)[0]].sort((slot1,slot2)=>{return slot1.slotId - slot2.slotId}).map((slot, columnIndex) => {

                return <Timeslot key={'courtno_column' + columnIndex} slot={{
                    row: 1,
                    column: columnIndex + 2,
                    text: TimeslotService.getTimerangeForSlot(slot)
                }}/>
            })}

            {Object.keys(timeslots).map((courtNo, rowIndex) => {
                return (
                    <React.Fragment key={rowIndex}>
                        {timeslots[courtNo].sort((slot1,slot2)=>{return slot1.slotId - slot2.slotId}).map((slot, columnIndex) => {
                            return <Timeslot key={slot.slotId}
                                             slot={{...slot, row: rowIndex + 2, column: columnIndex + 2}} onSelected={onSelected}/>
                        })}
                    </React.Fragment>
                )
            })}

            {Object.keys(reservedslots).map((courtNo, index) => {
                return (
                    <React.Fragment key={index}>
                        {reservedslots[courtNo].map((slot) => {
                            return <Timeslot key={slot.slotId}
                                             slot={slot} onSelected={onSelected}/>
                        })}
                    </React.Fragment>
                )
            })}
        </div>
    )

}

Timetable.propTypes = {
    timeslots: PropTypes.object,
};

export default Timetable;