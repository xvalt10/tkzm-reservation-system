import React, {useEffect} from "react";
import TimeslotService from "../services/TimeslotService";
import {Table, Thead, Tbody, Tr, Th, Td} from 'react-super-responsive-table';
import {RESERVATION_TYPES} from "../services/Constants";


const LongtermReservationTable = ({longtermReservations, onCancellation}) => {
    useEffect(() => {
        console.log(longtermReservations);
    }, [longtermReservations]);

    const cancelReservation = (event) => {
        //  setSpinnerStatuses(Object.assign([], { ...spinnerStatuses, [index]: true }));
        const reservation = event.target.dataset ? event.target.dataset.reservation : event.target.parentElement.parentElement.dataset.reservation;
        if (reservation) {
            onCancellation(RESERVATION_TYPES.LONGTERM,reservation)
        }

    }

    return (
        <Table>
            <Thead>
                <Tr>
                    <Th>Dvorec</Th>
                    <Th>Od</Th>
                    <Th>Do</Th>
                    <Th>Obdobie</Th>
                    <Th></Th>
                </Tr>

            </Thead>
            <Tbody>
                {longtermReservations.map((longtermReservation, index) => {
                    return (<Tr>
                        <Td key={'row' - index - '1'}>{longtermReservation.courtNumber}</Td>
                        <Td key={'row' - index - '2'}>{TimeslotService.formatDateLongTermReservation(longtermReservation.startHour, longtermReservation.startMinutes, longtermReservation.dayOfWeek)}</Td>
                        <Td key={'row' - index - '3'}>{TimeslotService.formatDateLongTermReservation(longtermReservation.endHour, longtermReservation.endMinutes, longtermReservation.dayOfWeek)}</Td>
                        <Td key={'row' - index - '4'}>{TimeslotService.formatDateMonthDay(longtermReservation.startDate)}-{TimeslotService.formatDateMonthDay(longtermReservation.endDate)} </Td>
                        <Td key={'row' - index - '5'}>
                            <button id={index} className="button is-info"
                                    data-reservation={JSON.stringify(longtermReservation)}
                                    onClick={cancelReservation}>
                                Zrušiť

                            </button>
                        </Td>
                    </Tr>)
                })
                }
            </Tbody>
        </Table>
    )

}

LongtermReservationTable.propTypes = {};

export default LongtermReservationTable;