import React, {useEffect, useState} from "react";
import Timetable from "../components/Timetable";
import ReserveTimeslotForm from "../components/ReserveTimeslotForm";
import {accountService} from "../services/auth/AuthService";
import TimeslotService from "../services/TimeslotService";
import {useNavigate} from "react-router-dom";
import UserMessage from "../components/UserMessage";
import {BACKEND_BASE_URL} from "../services/Constants";
import Loader from "react-loader-spinner";

const Reservation = ({}) => {
    const navigate = useNavigate();
    const [timeslots, setTimeslots] = useState(null);
    const [timeslotsPerDay, setTimeslotsPerDay] = useState({});
    const [reservationStatus, setReservationStatus] = useState(null);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [datesForReservation, setDatesForReservation] = useState([]);
    const [error, setError] = useState(null);


    function displayTimeslotsForSelectedDay(timeslots,date) {
        const datetokens = date.split(" ")[0].split(".")
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
                ).catch(error => setError(error.message))

            await fetch(`${BACKEND_BASE_URL}/timeslots/uniqueDates`)
                .then(res => res.json())
                .then(dates => {
                        setDatesForReservation(dates)
                        displayTimeslotsForSelectedDay(slots, selectedDate || dates[0]);
                    }
                ).catch(error => setError(error.message))

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
console.log(timeslot);
console.log(accountService.accountValue);
        if(!timeslot.userAccount || timeslot.userAccount.userId === accountService.accountValue.userId){
        timeslot.selected=true
        setSelectedTimeslot(timeslot)
        setTimeslotsPerDay(TimeslotService.markTimeslots(timeslotsPerDay,[timeslot.slotId]))}
    }

    const onEndTimeChange = (slotIdsToMark) =>{
        if(slotIdsToMark)
        setTimeslotsPerDay(TimeslotService.markTimeslots(timeslotsPerDay,slotIdsToMark))
    }

    const onReservation = ({courtnumber, startTime, endTime, errorMessage, operation}) => {
        loadTimetableData();
        if(errorMessage){
            setError(errorMessage);
        }else{
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
            <h3 className={'title'}>Aktuálna obsadenosť dvorcov</h3>
            {!timeslots && <h4 className={'user-message'}><Loader
                type="TailSpin"
                color="#00BFFF"
                height={'30px'}
                width={'30px'}/>Dáta sa načítavajú</h4>
            }

            {error && <UserMessage message={error} color={'indianred'}/>}
            {timeslots && <div className='form-control'>
                <label>Dátum rezervácie</label>

                <select onChange={(e) => onReservationDateChanged(e)}>
                    <>
                        {datesForReservation.map((uniqueDate) => {
                            return <option>{uniqueDate}</option>
                        })}</>
                </select>
            </div>}
            {reservationStatus && <h4 className={'user-message'}>{reservationStatus}</h4>}
            {timeslots && <Timetable timeslots={timeslotsPerDay} onSelected={onTimeslotSelected}/>}
            {selectedTimeslot && <ReserveTimeslotForm timeslots={timeslotsPerDay} selectedTimeslot={selectedTimeslot}
                                                      onReservation={onReservation} onEndTimeChange={onEndTimeChange}/>}
        </div>
    );
}

Reservation.propTypes = {};

export default Reservation;
