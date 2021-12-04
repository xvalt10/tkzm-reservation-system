import React, {useEffect, useState} from "react";
import TimeslotService from "../services/TimeslotService";


const UserReservationSummary = ({reservedTimeslots, onCancellation}) => {
    const [spinnerStatuses, setSpinnerStatuses] = useState([]);
    useEffect(() => {
        const spinnerDefaultStatuses = [];
        Object.keys(reservedTimeslots).forEach(courtNumber => {
            reservedTimeslots[courtNumber].forEach(slotIdsArray => spinnerDefaultStatuses.push(false));
        });
        setSpinnerStatuses(spinnerDefaultStatuses);
    }, [reservedTimeslots]);

    const cancelReservation = (event) => {
          //  setSpinnerStatuses(Object.assign([], { ...spinnerStatuses, [index]: true }));
            const slots = event.target.dataset? event.target.dataset.slots: event.target.parentElement.parentElement.dataset.slots;
            if(slots){onCancellation(slots)}

    }

    return (
        <div className={'table-container'}>


            <div className={'flex-table header'}>
                <div className={'flex-row'}>Dvorec</div>
                <div className={'flex-row'}>Od</div>
                <div className={'flex-row'}>Do</div>
                <div className={'flex-row first'}></div>

            </div>
            {Object.keys(reservedTimeslots).map((courtNumber) => {
                return (
                    reservedTimeslots[courtNumber].map((slotIdsArray, index) => {
                        return (<div className={'flex-table row'}>
                            <div className={'flex-row'}>{courtNumber}</div>
                            <div
                                className={'flex-row'}>{TimeslotService.formatDate(new Date(slotIdsArray[0].startTime))}</div>
                            <div
                                className={'flex-row'}>{TimeslotService.formatDate(new Date(slotIdsArray[slotIdsArray.length - 1].endTime))}</div>
                            <div className={'flex-row first'}>
                                <button id={index} className="button is-info" data-slots={slotIdsArray.map(slot => slot.slotId)}
                                        onClick={cancelReservation}>
                                    {/*<div style={{display: 'flex'}}>
                                        {spinnerStatuses[index]!==false && <Loader
                                            type="TailSpin"
                                            color="#00BFFF"
                                            height={'30px'}
                                            width={'30px'}
                                        />}
                                        <div style={{marginLeft: '10px'}}>*/}
                                            Zrušiť
                                        {/*</div>
                                    </div>*/}
                                </button>
                            </div>
                        </div>)
                    }))
            })}
        </div>
    )

}

UserReservationSummary.propTypes = {};

export default UserReservationSummary;