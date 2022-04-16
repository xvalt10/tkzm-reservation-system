import React, {useEffect, useState} from "react";
import TimeslotService from "../services/TimeslotService";
import {Table, Thead, Tbody, Tr, Th, Td} from 'react-super-responsive-table';
import {RESERVATION_TYPES} from "../services/Constants";


const OneTimeReservationTable = ({reservedTimeslots, onCancellation}) => {
    //const [spinnerStatuses, setSpinnerStatuses] = useState([]);
    useEffect(() => {
        // console.log(reservedTimeslots);
        // const spinnerDefaultStatuses = [];
        // Object.keys(reservedTimeslots).forEach(courtNumber => {
        //     reservedTimeslots[courtNumber].forEach(slotIdsArray => spinnerDefaultStatuses.push(false));
        // });
        // setSpinnerStatuses(spinnerDefaultStatuses);
    }, [reservedTimeslots]);

    const cancelReservation = (event) => {
        //  setSpinnerStatuses(Object.assign([], { ...spinnerStatuses, [index]: true }));
        const slots = event.target.dataset ? event.target.dataset.slots : event.target.parentElement.parentElement.dataset.slots;
        if (slots) {
            onCancellation(RESERVATION_TYPES.ONETIME, slots)
        }

    }

    return (
        <>
            {reservedTimeslots &&<h4 className={'subtitle'}>Aktuálne rezervácie (najbližších 14 dní)</h4>}
            {reservedTimeslots && reservedTimeslots.length === 0 &&
            <p className={'subtitle is-6 is-spaced'}>Nemáte zadanú žiadnu jednorázovú rezerváciu.</p>}
            {reservedTimeslots && reservedTimeslots.length > 0 &&
            <Table>
                <Thead className="table-header">
                    <Tr>
                        <Th>Dvorec</Th>
                        <Th>Od</Th>
                        <Th>Do</Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {reservedTimeslots.map((slot, index) => {
                        return (<Tr key={'row' - index}>
                            <Td key={'row' - index - '1'}>{slot.courtnumber}</Td>
                            <Td key={'row' - index - '2'}>{TimeslotService.formatDate(new Date(slot.startTime))}</Td>
                            <Td key={'row' - index - '3'}>{TimeslotService.formatDate(new Date(slot.endTime))}</Td>
                            <Td key={'row' - index - '4'}>
                                <button key={'button' - index - '4'} className="button is-info"
                                        data-slots={JSON.stringify(slot)}
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
                            </Td>
                        </Tr>)
                    })}
                </Tbody>
            </Table>}
        </>
    )

}

OneTimeReservationTable.propTypes = {};

export default OneTimeReservationTable;