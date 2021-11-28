import PropTypes from 'prop-types';
import Timeslot from "./Timeslot";
import TimeslotService from "../services/TimeslotService";

const Timetable = ({timeslots, onSelected}) => {
    const rowCount = timeslots && Object.keys(timeslots).length !== 0 ? Object.keys(timeslots).length + 1 : 0;
    const columnCount = timeslots && Object.keys(timeslots).length !== 0 ? timeslots[Object.keys(timeslots)[0]].length + 1 : 0
    return (
        Object.keys(timeslots).length > 0 &&
        <div style={{
            display: 'grid',
            overflowX: 'scroll',
            padding:'2px',
            gridTemplateColumns: `repeat(${columnCount})`,
            gridTemplateRows: `repeat(${rowCount})`,

        }}>
            {Object.keys(timeslots).map((courtNo, rowIndex) => {
                return <Timeslot key={'time_row' + rowIndex} slot={{row: rowIndex + 2, column: 1, text: `Court #${courtNo}`}}/>
            })}

            {timeslots[Object.keys(timeslots)[0]].map((slot, columnIndex) => {

                return <Timeslot key={'courtno_column' + columnIndex} slot={{
                    row: 1,
                    column: columnIndex + 2,
                    text: TimeslotService.getTimerangeForSlot(slot)
                }}/>
            })}

            {Object.keys(timeslots).map((courtNo, rowIndex) => {
                return (
                    <>
                        {timeslots[courtNo].map((slot, columnIndex) => {
                            return <Timeslot key={'t' + columnIndex}
                                             slot={{...slot, row: rowIndex + 2, column: columnIndex + 2}} onSelected={onSelected}/>
                        })}
                    </>
                )
            })}
        </div>
    )

}

Timetable.propTypes = {
    timeslots: PropTypes.object,
};

export default Timetable;