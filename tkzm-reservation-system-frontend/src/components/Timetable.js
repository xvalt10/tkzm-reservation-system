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
            padding:'1px',
            marginBottom:'10px',
            gridTemplateColumns: `repeat(${columnCount})`,
            gridTemplateRows: `repeat(${rowCount})`,

        }}>
         {/*   <div className={`sticky-left`} style={{
                gridRowStart: 1, gridRowEnd: 1,
                gridColumnStart: 1, gridColumnEnd: 1, background:'blue'}}

            >fsdfdss</div>*/}
            <Timeslot key={'topleft'} slot={{row: 1, column: 1, text: ` `}}/>
            {Object.keys(timeslots).map((courtNo, rowIndex) => {
                return <Timeslot key={'time_row' + rowIndex+courtNo} slot={{row: rowIndex + 2, column: 1, text: `Kurt ${courtNo}`}}/>
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
                            return <Timeslot key={'t' + columnIndex+courtNo}
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