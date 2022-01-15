import React, {useEffect, useState} from "react";
import Timetable from "../components/Timetable";
import OneTimeReservationForm from "../components/OneTimeReservationForm";
import {accountService} from "../services/auth/AuthService";
import TimeslotService from "../services/TimeslotService";
import {useNavigate} from "react-router-dom";
import UserMessage from "../components/UserMessage";
import {BACKEND_BASE_URL} from "../services/Constants";
import Loader from "react-loader-spinner";
import LongtermReservationForm from "../components/LongtermReservationForm";

const Reservation = ({}) => {
    const navigate = useNavigate();
    const reservationTypes = {
        'LONGTERM':'longterm',
        'ONETIME':'onetime'
    }
    const [timeslots, setTimeslots] = useState(null);
    const [timeslotsPerDay, setTimeslotsPerDay] = useState({});
    const [reservationStatus, setReservationStatus] = useState(null);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [datesForReservation, setDatesForReservation] = useState([]);
    const [error, setError] = useState(null);
    const [reservationType, setReservationType] = useState(reservationTypes.ONETIME);


    function displayTimeslotsForSelectedDay(timeslots, date) {
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
                .then(timeslotsFromServer => {
                    console.log(timeslotsFromServer)
                        slots = timeslotsFromServer;
                        TimeslotService.getReservationCountValueSubject().next(TimeslotService.countReservationsByUser(slots,accountService.accountValue.name));
                        setTimeslots(timeslotsFromServer)
                    }
                ).catch(error => {console.log(error); setError(error.message)})

            await fetch(`${BACKEND_BASE_URL}/timeslots/uniqueDates`)
                .then(res => res.json())
                .then(dates => {
                        if (dates.length == 0) {
                            setError("Načítanie dát nebolo úspešné.")
                        } else {
                            setDatesForReservation(dates)
                            displayTimeslotsForSelectedDay(slots, selectedDate || dates[0]);
                        }
                    }
                ).catch(error => setError(error.message))

        }
        getTimetableData()
    }

    useEffect(() => {
        if (!accountService.accountValue) {
            navigate('/');
        } else {
            loadTimetableData();
        }
    }, [])

    const onReservationDateChanged = (event) => {
        setSelectedDate(datesForReservation[event.target.selectedIndex]);
        displayTimeslotsForSelectedDay(timeslots, datesForReservation[event.target.selectedIndex]);
    }

    const onReservationTypeChanged = (event) => {
        setReservationType(event.target.value);
    }
    const onTimeslotSelected = (timeslot) => {
        console.log(timeslot);
        console.log(accountService.accountValue);
        if (!timeslot.username|| timeslot.username === accountService.accountValue.name) {
            timeslot.selected = true
            setSelectedTimeslot(timeslot)
            setTimeslotsPerDay(TimeslotService.markTimeslots(timeslotsPerDay, [timeslot.slotId]))
        }
    }

    const onEndTimeChange = (slotIdsToMark) => {
        if (slotIdsToMark)
            setTimeslotsPerDay(TimeslotService.markTimeslots(timeslotsPerDay, slotIdsToMark))
    }

    const onReservation = ({courtnumber, startTime, endTime, errorMessage, operation}) => {
        loadTimetableData();
        if (errorMessage) {
            setError(errorMessage);
        } else {
            if (operation === 'canceling') {
                TimeslotService.getReservationCountValueSubject().next(TimeslotService.getReservationCountValueSubject().value - 1);
                setReservationStatus(`Rezervácia dvorca ${courtnumber} od ${startTime} do ${endTime} bola zrušená.`);
            } else {
                TimeslotService.getReservationCountValueSubject().next(TimeslotService.getReservationCountValueSubject().value + 1);
                setReservationStatus(`Rezervácia dvorca ${courtnumber} od ${startTime} do ${endTime} prebehla úspešne.`);
            }
        }

        setSelectedTimeslot(null);
    }

    const onLongtermReservation = ({courtnumber, startTime, endTime, startDate, endDate, dayOfWeek, errorMessage, operation}) => {
        loadTimetableData();
        if (errorMessage) {
            setError(errorMessage);
        } else {
            if (operation === 'canceling') {
                setReservationStatus(`Dlhodobá rezervácia dvorca ${courtnumber} (${dayOfWeek} ${startTime}-${endTime} od ${TimeslotService.formatDateMonthDay(startDate)} do ${TimeslotService.formatDateMonthDay(endDate)}) bola zrušená.`);
            } else {
                setReservationStatus(`Dlhodobá rezervácia dvorca ${courtnumber} (${dayOfWeek} ${startTime}-${endTime} od ${TimeslotService.formatDateMonthDay(startDate)} do ${TimeslotService.formatDateMonthDay(endDate)}) prebehla úspešne.`);
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
            {selectedTimeslot && <div className="containerTimeslotForm"><div className="form-control-check" onChange={(e) => onReservationTypeChanged(e)}>
                <label>Typ rezervácie</label>
                <input type="radio" value={reservationTypes.ONETIME} name="reservation-type" checked={reservationType === reservationTypes.ONETIME}/> Jednorázová
                <input type="radio" value={reservationTypes.LONGTERM} name="reservation-type" checked={reservationType === reservationTypes.LONGTERM}/> Dlhodobá
            </div></div>}

            {selectedTimeslot && reservationType===reservationTypes.ONETIME && <OneTimeReservationForm timeslots={timeslotsPerDay} selectedTimeslot={selectedTimeslot}
                                                         onReservation={onReservation} onEndTimeChange={onEndTimeChange}/>}


            {selectedTimeslot && reservationType===reservationTypes.LONGTERM && <LongtermReservationForm timeslots={timeslotsPerDay} selectedTimeslot={selectedTimeslot}
                                                                                                       onReservation={onLongtermReservation} onEndTimeChange={onEndTimeChange}/>}
        </div>
    );
}

Reservation.propTypes = {};

export default Reservation;
