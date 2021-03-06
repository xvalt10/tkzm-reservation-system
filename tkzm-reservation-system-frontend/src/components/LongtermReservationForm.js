import React, {useEffect, useState} from 'react';
import TimeslotService from "../services/TimeslotService";
import {accountService} from "../services/auth/AuthService";
import Loader from "react-loader-spinner";
import UserMessage from "./UserMessage";
import {BACKEND_BASE_URL} from "../services/Constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const LongtermReservationForm = ({timeslots,reservedTimeslots, selectedTimeslot, onReservation, onEndTimeChange}) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [endTime, setEndTime] = useState(TimeslotService.formatDateShort(new Date(selectedTimeslot.endTime)))
    const [startTime, setStartTime] = useState(TimeslotService.formatDateShort(new Date(selectedTimeslot.startTime)))
    const [timeslotsAfterSelectedTimeslot, setTimeslotsAfterSelectedTimeslot] = useState(TimeslotService.getTimeslotsByDateAndCourt(timeslots, new Date(selectedTimeslot.startTime), selectedTimeslot.courtnumber));
    const [longtermReservationParams, setLongtermReservationParams] = useState(
        {
            'courtNumber': selectedTimeslot.courtnumber,
            'dayOfWeek': new Date(selectedTimeslot.startTime).getUTCDay(),
            'startHour': new Date(selectedTimeslot.startTime).getUTCHours(),
            'startMinutes': new Date(selectedTimeslot.startTime).getUTCMinutes(),
            'endHour': new Date(selectedTimeslot.endTime).getUTCHours(),
            'endMinutes': new Date(selectedTimeslot.endTime).getUTCMinutes(),
            'startDate': startDate,
            'endDate': endDate,
        });
    const [showSubmitButtonLoad, setShowSubmitButtonLoad] = useState(false);
    const [error, setError] = useState(null);


    const onReservationEndTimeChange = (event) => {
        const endDatetime = new Date(timeslotsAfterSelectedTimeslot[event.target.selectedIndex].endTime);
        const selectedTimeslotIds = TimeslotService.getTimeslotIdsForTimeRange(timeslots, selectedTimeslot.courtnumber,
            new Date(selectedTimeslot.startTime), endDatetime);
        setLongtermReservationParams({
            ...longtermReservationParams,
            endHour: endDatetime.getUTCHours(),
            endMinutes: endDatetime.getUTCMinutes()
        });
        setEndTime(event.target.value)
        onEndTimeChange(selectedTimeslotIds);
    }

    const onStartDateChange = (newStartDate) => {
        setStartDate(newStartDate);
        setLongtermReservationParams({...longtermReservationParams, startDate: newStartDate});
    }

    const onEndDateChange = (newEndDate) => {
        setEndDate(newEndDate);
        setLongtermReservationParams({...longtermReservationParams, endDate: newEndDate});
    }

    useEffect(() => {
        setTimeslotsAfterSelectedTimeslot(!TimeslotService.isSlotReserved(selectedTimeslot) ?
            TimeslotService.getTimeslotsByDateAndCourt(timeslots, new Date(selectedTimeslot.startTime), selectedTimeslot.courtnumber):
            TimeslotService.getMyReservedSlotsAfterSelectedTimeslot(timeslots, selectedTimeslot, accountService.accountValue.name));
        setLongtermReservationParams(
            {
                'courtNumber': selectedTimeslot.courtnumber,
                'dayOfWeek': new Date(selectedTimeslot.startTime).getUTCDay() === 0 ? 7 : new Date(selectedTimeslot.startTime).getUTCDay(),
                'startHour': new Date(selectedTimeslot.startTime).getUTCHours(),
                'startMinutes': new Date(selectedTimeslot.startTime).getUTCMinutes(),
                'endHour': new Date(selectedTimeslot.endTime).getUTCHours(),
                'endMinutes': new Date(selectedTimeslot.endTime).getUTCMinutes(),
                'startDate': startDate,
                'endDate': endDate,
            })
        setEndTime(TimeslotService.formatDateShort(new Date(selectedTimeslot.endTime)));
    }, [selectedTimeslot]);


    const onSubmit = (e) => {
        e.preventDefault()
        const requestOptions = {
            method: 'PUT',
            body: JSON.stringify(longtermReservationParams)
        };
        setShowSubmitButtonLoad(true);
        const backendURL = TimeslotService.isSlotReserved(selectedTimeslot) ? `${BACKEND_BASE_URL}/timeslots/longterm-reservation/cancel` :
            `${BACKEND_BASE_URL}/timeslots/longterm-reservation/${accountService.accountValue.name}`;
        fetch(backendURL, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.status > 400) {
                    onReservation({
                        errorMessage: data.message,
                    })
                } else {
                    onReservation({
                        courtnumber: selectedTimeslot.courtnumber,
                        dayOfWeek: TimeslotService.getDayOfWeek(new Date(selectedTimeslot.startTime)),
                        startTime: startTime,
                        endTime: endTime,
                        startDate: startDate,
                        endDate: endDate,
                        errorMessage: null,
                        operation: TimeslotService.isSlotReserved(selectedTimeslot) ? 'canceling' : 'reservation'
                    })
                }
                setShowSubmitButtonLoad(false);
            }).catch(
            error => {
                setError("Pri rezerv??cii dvorca sa vyskytla chyba, zadajte rezerv??ciu znova.");
                console.log(error)
            });
    }
    return (
        <div className={'containerTimeslotForm'}>

            <form className='reserve-court-form' onSubmit={onSubmit}>
                {error && <UserMessage message={error} color={'indianred'}/>}
                {/*<h3 className="title is-5">{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Formul??r na zru??enie dlhodobej rezerv??cie' : 'Formul??r na zadanie dlhodobej rezerv??cie'}</h3>*/}
                <div style={{display: 'flex', flexDirection: 'row', justifyItems: 'space-evenly'}}>
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
                        <label>De?? v t????dni</label>
                        <input
                            type='text'
                            placeholder='Day of week'
                            value={TimeslotService.getDayOfWeek(new Date(selectedTimeslot.startTime))}
                            readOnly={true}
                        />
                    </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', justifyItems: 'space-evenly'}}>
                    <div className='form-control'>
                        <label>V ??ase od:</label>
                        <input
                            type='text'
                            placeholder='Start time'
                            value={TimeslotService.formatDateShort(new Date(selectedTimeslot.startTime))}
                            readOnly={true}
                        />
                    </div>
                    <div className='form-control'>
                        <label>V ??ase do:</label>
                        <select
                            onChange={(e) => onReservationEndTimeChange(e)}
                        >
                            <>
                                {timeslotsAfterSelectedTimeslot.length === 0 ?
                                    <option>{TimeslotService.formatDateShort(new Date(selectedTimeslot.endTime))}</option>
                                    :
                                    timeslotsAfterSelectedTimeslot.map((timeslot, index) => {
                                        return <option
                                            key={index}>{TimeslotService.formatDateShort(new Date(timeslot.endTime))}</option>;
                                    })}
                            </>
                        </select>
                    </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', justifyItems: 'space-evennly'}}>
                    <div className='form-control'>
                        <label>V obdob?? od:</label>
                        <DatePicker selected={startDate} onChange={(date) => onStartDateChange(date)}/>
                    </div>

                    <div className='form-control'>
                        <label>V obdob?? do:</label>
                        <DatePicker selected={endDate} onChange={(date) => onEndDateChange(date)}/>
                    </div>
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
                            <div
                                style={{marginLeft: '10px'}}>{TimeslotService.isSlotReserved(selectedTimeslot) ? 'Zru??i?? dlhodob?? rezerv??ciu dvorca' : 'Zada?? dlhodob?? rezerv??ciu dvorca'}</div>
                        </div>
                    </button>
                </div>
            </form>
        </div>


    );
}


LongtermReservationForm.propTypes = {};

export default LongtermReservationForm;