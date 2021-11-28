import React, {useEffect, useState} from "react";
import Timetable from "../components/Timetable";
import ReserveTimeslotForm from "../components/ReserveTimeslotForm";
import {accountService} from "../services/auth/AuthService";
import TimeslotService from "../services/TimeslotService";
import {useNavigate} from "react-router-dom";
import UserMessage from "../components/UserMessage";
import {BACKEND_BASE_URL} from "../services/Constants";

const Reservation = ({}) => {
    const navigate = useNavigate();
    const [timeslots, setTimeslots] = useState({});
    const [timeslotsPerDay, setTimeslotsPerDay] = useState({});
    const [reservationStatus, setReservationStatus] = useState(null);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [datesForReservation, setDatesForReservation] = useState([]);
    const [error, setError] = useState(null);



    function displayTimeslotsForSelectedDay(timeslots,date) {
        const datetokens = date.split(".")
        const day = +datetokens[0]
        const month = +datetokens[1]
        setTimeslotsPerDay(TimeslotService.getTimeslotsByDayMonth(timeslots, day, month));
    }

    function loadTimetableData() {
        const getTimetableData = async () => {
            let slots = []
            await fetch(`${BACKEND_BASE_URL}/timeslots/byCourt`)
                .then(res => res.json())
                .then(timeslotsFromServer => {slots = timeslotsFromServer;
                    setTimeslots(timeslotsFromServer)}
                ).catch(error => setError(error))

            await fetch(`${BACKEND_BASE_URL}/timeslots/uniqueDates`)
                .then(res => res.json())
                .then(dates => {
                        setDatesForReservation(dates)
                        displayTimeslotsForSelectedDay(slots, selectedDate || dates[0]);
                    }
                ).catch(error => setError(error))

        }
        getTimetableData()
    }

    useEffect(() => {
        if (!accountService.accountValue) {
            navigate('/');
        }else{
        loadTimetableData();}
    }, [])

    const onReservationDateChanged = (event) => {
        setSelectedDate(datesForReservation[event.target.selectedIndex]);
        displayTimeslotsForSelectedDay(timeslots,datesForReservation[event.target.selectedIndex]);
    }
    const onTimeslotSelected = (timeslot) => {
        timeslot.selected=true
        setSelectedTimeslot(timeslot)
        setTimeslotsPerDay(TimeslotService.markTimeslots(timeslotsPerDay,[timeslot.slotId]))
    }

    const onEndTimeChange = (slotIdsToMark) =>{
        if(slotIdsToMark)
        setTimeslotsPerDay(TimeslotService.markTimeslots(timeslotsPerDay,slotIdsToMark))
    }

    const onReservation = ({courtnumber, startTime, endTime, success, operation}) => {
        loadTimetableData();
        if(success){
            if(operation === 'canceling'){
                setReservationStatus(`Rezervácia dvorca ${courtnumber} od ${startTime} do ${endTime} bola zrušená.`);
            }else{
                setReservationStatus(`Rezervácia dvorca ${courtnumber} od ${startTime} do ${endTime} prebehla úspešne.`);
            }
        }

        setSelectedTimeslot(null);
    }

    return (
        <div>
            <h3>Aktuálna obsadenosť dvorcov</h3>
            {error && <UserMessage message={error} color={'indianred'}/>}
            <div className='form-control'>
                <label>Dátum rezervácie</label>

                <select onChange={(e) => onReservationDateChanged(e)}>
                    <>
                        {datesForReservation.map((uniqueDate) => {
                            return <option>{uniqueDate}</option>
                        })}</>
                </select>
            </div>
            {reservationStatus && <h4 className={'user-message'}>{reservationStatus}</h4>}
            <Timetable timeslots={timeslotsPerDay} onSelected={onTimeslotSelected}/>
            {selectedTimeslot && <ReserveTimeslotForm timeslots={timeslotsPerDay} selectedTimeslot={selectedTimeslot}
                                                      onReservation={onReservation} onEndTimeChange={onEndTimeChange}/>}
        </div>
    );
}

Reservation.propTypes = {};

export default Reservation;
