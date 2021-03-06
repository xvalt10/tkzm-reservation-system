import React, {useEffect, useState} from 'react';
import TimeslotService from "../services/TimeslotService";
import {accountService} from "../services/auth/AuthService";
import Loader from "react-loader-spinner";
import UserMessage from "./UserMessage";
import {BACKEND_BASE_URL} from "../services/Constants";

const OneTimeReservationForm = ({timeslots, selectedTimeslot, onReservation, onEndTimeChange, reservedTimeslots}) => {
    const [endTime, setEndTime] = useState(TimeslotService.formatDate(new Date(selectedTimeslot.endTime)))
    const [startTime, setStartTime] = useState(TimeslotService.formatDate(new Date(selectedTimeslot.startTime)))
    const [timeslotsAfterSelectedTimeslot, setTimeslotsAfterSelectedTimeslot] = useState(TimeslotService.getVacantSlotsAfterSelectedTimeslot(timeslots, reservedTimeslots, selectedTimeslot));
    //const [slotIdsToReserve, setSlotIdsToReserve] = useState([selectedTimeslot.slotId]);
    const [showSubmitButtonLoad, setShowSubmitButtonLoad] = useState(false);
    const [error, setError] = useState(null);
    const [reservationParams, setReservationParams] = useState(selectedTimeslot)


    const onReservationEndTimeChange = (event) => {
        const selectedTimeslotIds = TimeslotService.getTimeslotIdsForTimeRange(timeslots, selectedTimeslot.courtnumber,
            new Date(selectedTimeslot.startTime), new Date(timeslotsAfterSelectedTimeslot[event.target.selectedIndex].endTime));

        setReservationParams({...reservationParams, selectedTimeslot: {...selectedTimeslot,endTime:new Date(timeslotsAfterSelectedTimeslot[event.target.selectedIndex].endTime).toISOString()}});
        setEndTime(event.target.value)
        onEndTimeChange(selectedTimeslotIds);
    }

    useEffect(() => {
        setTimeslotsAfterSelectedTimeslot(!TimeslotService.isSlotReserved(selectedTimeslot) ?
            TimeslotService.getVacantSlotsAfterSelectedTimeslot(timeslots, reservedTimeslots,  selectedTimeslot) :
            TimeslotService.getMyReservedSlotsAfterSelectedTimeslot(timeslots, selectedTimeslot, accountService.accountValue.name));
        setReservationParams({selectedTimeslot});
        setEndTime(TimeslotService.formatDate(new Date(selectedTimeslot.endTime)));

    }, [selectedTimeslot]);

    const onModalClose=(e)=>{
        e.preventDefault();
        selectedTimeslot = null;
    }


    const onSubmit = (e) => {
        e.preventDefault()
        const requestOptions = {
            method: 'PUT',
            body: JSON.stringify(reservationParams.selectedTimeslot)
        };
        setShowSubmitButtonLoad(true);
        const backendURL = TimeslotService.isSlotReserved(selectedTimeslot) ? `${BACKEND_BASE_URL}/timeslots/cancel/onetime/${selectedTimeslot.slotId}` :
            `${BACKEND_BASE_URL}/timeslots/reserve/${accountService.accountValue.name}`;
        fetch(backendURL, requestOptions)
            .then(response => response.json())
            .then(data => {

                setReservationParams({});
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
                error=>{setError("Pri rezerv??cii dvorca sa vyskytla chyba, zadajte rezerv??ciu znova.");
                    console.log(error)});
    }
    return (
        <div className={'containerTimeslotForm'}>

            <form className='reserve-court-form' onSubmit={onSubmit}>
                {error && <UserMessage message={error} color={'indianred'}/>}
                <h3 className="title is-5">{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Formul??r na zru??enie rezerv??cie' : 'Formul??r na zadanie rezerv??cie'}</h3>
                <div className='form-control'>
                    <label>Dvorec ????slo</label>
                    <input
                        type='text'
                        placeholder='Court'
                        value={selectedTimeslot.courtnumber}
                        readOnly={true}
                    />
                </div>
                <div className='form-control'>
                    <label>{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Zru??i?? rezerv??ciu od' : 'Rezerv??cia od'}</label>
                    <input
                        type='text'
                        placeholder='Start time'
                        value={TimeslotService.formatDate(new Date(selectedTimeslot.startTime))}
                        readOnly={true}
                    />
                </div>
                <div className='form-control'>
                    <label>{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Zru??i?? rezerv??ciu do' : 'Rezerv??cia do'}</label>
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
                        <div style={{marginLeft: '10px'}}>{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Zru??i?? rezerv??ciu dvorca' : 'Rezervova?? dvorec'}</div>
                    </div>
                </button>
                </div>
            </form>
        </div>


    );
}


OneTimeReservationForm.propTypes = {};

export default OneTimeReservationForm;