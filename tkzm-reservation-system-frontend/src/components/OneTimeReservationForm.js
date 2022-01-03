import React, {useEffect, useState} from 'react';
import TimeslotService from "../services/TimeslotService";
import {accountService} from "../services/auth/AuthService";
import Loader from "react-loader-spinner";
import UserMessage from "./UserMessage";
import {BACKEND_BASE_URL} from "../services/Constants";

const OneTimeReservationForm = ({timeslots, selectedTimeslot, onReservation, onEndTimeChange}) => {
    const [endTime, setEndTime] = useState(TimeslotService.formatDate(new Date(selectedTimeslot.endTime)))
    const [startTime, setStartTime] = useState(TimeslotService.formatDate(new Date(selectedTimeslot.startTime)))
    const [timeslotsAfterSelectedTimeslot, setTimeslotsAfterSelectedTimeslot] = useState(TimeslotService.getVacantSlotsAfterSelectedTimeslot(timeslots, selectedTimeslot));
    const [slotIdsToReserve, setSlotIdsToReserve] = useState([selectedTimeslot.slotId]);
    const [showSubmitButtonLoad, setShowSubmitButtonLoad] = useState(false);
    const [error, setError] = useState(null);


    const onReservationEndTimeChange = (event) => {
        const selectedTimeslotIds = TimeslotService.getTimeslotIdsForTimeRange(timeslots, selectedTimeslot.courtnumber,
            new Date(selectedTimeslot.startTime), new Date(timeslotsAfterSelectedTimeslot[event.target.selectedIndex].endTime));
        setSlotIdsToReserve(selectedTimeslotIds);
        setEndTime(event.target.value)
        onEndTimeChange(selectedTimeslotIds);
    }

    useEffect(() => {
        setTimeslotsAfterSelectedTimeslot(!TimeslotService.isSlotReserved(selectedTimeslot) ?
            TimeslotService.getVacantSlotsAfterSelectedTimeslot(timeslots, selectedTimeslot) :
            TimeslotService.getMyReservedSlotsAfterSelectedTimeslot(timeslots, selectedTimeslot, accountService.accountValue.name));
        setSlotIdsToReserve([selectedTimeslot.slotId]);
        setEndTime(TimeslotService.formatDate(new Date(selectedTimeslot.endTime)));

    }, [selectedTimeslot]);


    const onSubmit = (e) => {
        e.preventDefault()
        const requestOptions = {
            method: 'PUT',
            body: JSON.stringify(slotIdsToReserve)
        };
        setShowSubmitButtonLoad(true);
        const backendURL = TimeslotService.isSlotReserved(selectedTimeslot) ? `${BACKEND_BASE_URL}/timeslots/cancel` :
            `${BACKEND_BASE_URL}/timeslots/reserve/${accountService.accountValue.name}`;
        fetch(backendURL, requestOptions)
            .then(response => response.json())
            .then(data => {

                setSlotIdsToReserve([]);
                if(data.status>400){
                    onReservation({
                        errorMessage: data.message,
                    })
                }else{
                onReservation({
                    courtnumber: selectedTimeslot.courtnumber,
                    startTime: startTime,
                    endTime: endTime,
                    errorMessage: null,
                    operation: TimeslotService.isSlotReserved(selectedTimeslot) ? 'canceling' : 'reservation'
                })}
                setShowSubmitButtonLoad(false);
            }).catch(
                error=>{setError("Pri rezervácii dvorca sa vyskytla chyba, zadajte rezerváciu znova.");
                    console.log(error)});
    }
    return (
        <div className={'containerTimeslotForm'}>

            <form className='reserve-court-form' onSubmit={onSubmit}>
                {error && <UserMessage message={error} color={'indianred'}/>}
                <h3 className="title is-5">{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Formulár na zrušenie rezervácie' : 'Formulár na zadanie rezervácie'}</h3>
                <div className='form-control'>
                    <label>Dvorec číslo</label>
                    <input
                        type='text'
                        placeholder='Court'
                        value={selectedTimeslot.courtnumber}
                        readOnly={true}
                    />
                </div>
                <div className='form-control'>
                    <label>{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Zrušiť rezerváciu od' : 'Rezervácia od'}</label>
                    <input
                        type='text'
                        placeholder='Start time'
                        value={TimeslotService.formatDate(new Date(selectedTimeslot.startTime))}
                        readOnly={true}
                    />
                </div>
                <div className='form-control'>
                    <label>{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Zrušiť rezerváciu do' : 'Rezervácia do'}</label>
                    <select
                        onChange={(e) => onReservationEndTimeChange(e)}
                    >
                        <>
                            {timeslotsAfterSelectedTimeslot.length === 0 ?
                                <option>{TimeslotService.formatDate(new Date(selectedTimeslot.endTime))}</option>
                                :
                                timeslotsAfterSelectedTimeslot.map((timeslot, index) => {
                                    return <option
                                        key={index}>{TimeslotService.formatDate(new Date(timeslot.endTime))}</option>;
                                })}
                        </>
                    </select>
                </div>

                {/*<input className={'btn'} type='submit' value className='btn btn-block'/>*/}
                <div style={{display: 'flex', justifyContent: 'center'}}>
                <button className="button is-rounded is-info" onClick={onSubmit}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        {showSubmitButtonLoad && <Loader
                            type="TailSpin"
                            color="#00BFFF"
                            height={'30px'}
                            width={'30px'}
                        />}
                        <div style={{marginLeft: '10px'}}>{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Zrušiť rezerváciu dvorca' : 'Rezervovať dvorec'}</div>
                    </div>
                </button>
                </div>
            </form>
        </div>


    );
}


OneTimeReservationForm.propTypes = {};

export default OneTimeReservationForm;