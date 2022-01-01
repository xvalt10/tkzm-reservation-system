import React, {useEffect, useState} from "react";
import TimeslotService from "../services/TimeslotService";


const LongtermReservationTable = ({longtermReservations, onCancellation}) => {
    useEffect(() => {
console.log(longtermReservations);
    }, [longtermReservations]);

    const cancelReservation = (event) => {
        //  setSpinnerStatuses(Object.assign([], { ...spinnerStatuses, [index]: true }));
        const reservation = event.target.dataset ? event.target.dataset.reservation : event.target.parentElement.parentElement.dataset.reservation;
        if (reservation) {
            onCancellation(reservation)
        }

    }

    return (
        <div className={'table-container'}>
            <div className={'flex-table header'}>
                <div className={'flex-row2'}>Dvorec</div>
                <div className={'flex-row2'}>Od</div>
                <div className={'flex-row2'}>Do</div>
                <div className={'flex-row2'}>Obdobie</div>
                <div className={'flex-row2 first'}></div>
            </div>

            {longtermReservations.map((longtermReservation, index) => {
                return (<div className={'flex-table row'}>
                    <div className={'flex-row2'}>{longtermReservation.courtNumber}</div>
                    <div
                        className={'flex-row2'}>{TimeslotService.formatDateLongTermReservation(longtermReservation.startHour,longtermReservation.startMinutes, longtermReservation.dayOfWeek)}</div>
                    <div
                        className={'flex-row2'}>{TimeslotService.formatDateLongTermReservation(longtermReservation.endHour,longtermReservation.endMinutes, longtermReservation.dayOfWeek)}</div>
                  <div className={'flex-row2'}>{TimeslotService.formatDateMonthDay(longtermReservation.startDate)}-{TimeslotService.formatDateMonthDay(longtermReservation.endDate)} </div>
                    <div className={'flex-row2 first'}>
                        <button id={index} className="button is-info" data-reservation={JSON.stringify(longtermReservation)}
                                onClick={cancelReservation}>
                            Zrušiť

                        </button>
                    </div>
                </div>)
            })
            }
        </div>
    )

}

LongtermReservationTable.propTypes = {};

export default LongtermReservationTable;