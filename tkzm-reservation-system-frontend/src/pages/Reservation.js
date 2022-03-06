import React, {useEffect, useRef, useState} from "react";
import Timetable from "../components/Timetable";
import OneTimeReservationForm from "../components/OneTimeReservationForm";
import {accountService} from "../services/auth/AuthService";
import TimeslotService from "../services/TimeslotService";
import {useNavigate} from "react-router-dom";
import UserMessage from "../components/UserMessage";
import {BACKEND_BASE_URL, MODAL_CUSTOM_STYLES, RESERVATION_TYPES, VIEW_MODES} from "../services/Constants";
import Loader from "react-loader-spinner";
import Modal from 'react-modal';
import LongtermReservationForm from "../components/LongtermReservationForm";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWindowClose} from "@fortawesome/free-solid-svg-icons";
import {isMobile} from "react-device-detect";

const Reservation = ({}) => {
    const navigate = useNavigate();
    const selectedDateSelectBox = useRef(null);
    let loadDataIntervalId = null;
    const [timeslots, setTimeslots] = useState(null);
    const [timeslotsArray, setTimeslotsArray] = useState([]);
    const [reservedSlotsArray, setReservedSlotsArray] = useState([]);
    const [reservedSlots, setReservedSlots] = useState({});
    const [viewMode, setViewMode] = useState(VIEW_MODES.ONEDAY);
    const [reservedSlotsPerDay, setReservedSlotsPerDay] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [timeslotsPerDay, setTimeslotsPerDay] = useState({});
    const [reservationStatus, setReservationStatus] = useState(null);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [datesForReservation, setDatesForReservation] = useState([]);
    const [error, setError] = useState(null);
    const [reservationType, setReservationType] = useState(RESERVATION_TYPES.ONETIME);

    function displayTimeslotsForSelectedDay(timeslots, reservedslots, date) {
        setTimeslotsPerDay(filterSlotsForDate(timeslots, date));
        setReservedSlotsPerDay(filterSlotsForDate(reservedslots, date));
    }

    function filterSlotsForDate(timeslots, date) {
        const datetokens = date.split(" ")[0].split(".");
        const day = +datetokens[0];
        const month = +datetokens[1];
        return TimeslotService.getTimeslotsByDayMonth(timeslots, day, month);
    }

    function loadMultipleTimetables(dates, timeslots, reservedSlots) {
        const groupedTimeslots = []
        const groupedReservedslots = [];
        dates.forEach(date => {
            groupedTimeslots.push(filterSlotsForDate(timeslots, date));
            groupedReservedslots.push(filterSlotsForDate(reservedSlots, date));
        })
        setTimeslotsArray(groupedTimeslots);
        setReservedSlotsArray(groupedReservedslots)
    }

    function loadTimetableData() {
        const getTimetableData = async () => {
            let reservedSlots = {}
            await fetch(`${BACKEND_BASE_URL}/timeslots/byCourt`)
                .then(res => res.json())
                .then(reservedSlotsFromServer => {

                        reservedSlots = TimeslotService.addColumnAndRowToReservedSlots(reservedSlotsFromServer);
                        TimeslotService.getReservationCountValueSubject().next(TimeslotService.countReservationsByUser(reservedSlots, accountService.accountValue.name));
                        let {timeslots, dates} = TimeslotService.generateTimetableData(6, 22, 14, 5);

                        setTimeslots(timeslots);
                        setDatesForReservation(dates);
                        setReservedSlots(reservedSlots);
                        if (viewMode === VIEW_MODES.ONEDAY) {
                            setSelectedDate(prevSelectedDate => prevSelectedDate == null ? dates[0] : prevSelectedDate);
                            displayTimeslotsForSelectedDay(timeslots, reservedSlots, dates[selectedDateSelectBox.current ? selectedDateSelectBox.current.selectedIndex : 0]);
                        }else{
                            loadMultipleTimetables(dates, timeslots, reservedSlots);
                        }
                        setError(null);
                    }
                ).catch(error => {
                    console.log(error);
                    setError("Načítanie dát nebolo úspešne. Skúste stránku znova načítať.")
                })
        }
        getTimetableData();

    }

    useEffect(() => {
        if (!accountService.accountValue) {
            navigate('/');
        } else {
            loadTimetableData();
            if (!loadDataIntervalId) {
                loadDataIntervalId = setInterval(loadTimetableData, 60000);
            }
        }
        return () => {
            clearInterval(loadDataIntervalId);
        }
    }, [])

    const onReservationDateChanged = (event) => {
        setSelectedDate(datesForReservation[event.target.selectedIndex]);
        displayTimeslotsForSelectedDay(timeslots, reservedSlots, datesForReservation[event.target.selectedIndex]);
    }

    const onReservationTypeChanged = (event) => {
        setReservationType(event.target.value);
    }
    const onTimeslotSelected = (timeslot) => {
        console.log(timeslot);
        console.log(accountService.accountValue);
        if (!timeslot.username || timeslot.username === accountService.accountValue.name) {
            timeslot.selected = true
            setSelectedTimeslot(timeslot);

            if (viewMode === VIEW_MODES.FIVEDAYS) {
                setTimeslotsPerDay(TimeslotService.markTimeslots(filterSlotsForDate(timeslots, TimeslotService.formatDateMonthDay(timeslot.startTime)), [timeslot.slotId]));
            } else {
                setTimeslotsPerDay(TimeslotService.markTimeslots(timeslotsPerDay, [timeslot.slotId]))
            }
        }
    }

    const closeModal = () => {
        setSelectedTimeslot(null);
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

    const onViewModeChanged = (e) => {
        setViewMode(e.target.value);
        if (e.target.value === VIEW_MODES.ONEDAY) {
            setSelectedDate(prevSelectedDate => prevSelectedDate == null ? datesForReservation[0] : prevSelectedDate);
            displayTimeslotsForSelectedDay(timeslots, reservedSlots, datesForReservation[selectedDateSelectBox.current ? selectedDateSelectBox.current.selectedIndex : 0]);
        }else{
            loadMultipleTimetables(datesForReservation, timeslots, reservedSlots);
        }
    }

    const onLongtermReservation = ({
                                       courtnumber,
                                       startTime,
                                       endTime,
                                       startDate,
                                       endDate,
                                       dayOfWeek,
                                       errorMessage,
                                       operation
                                   }) => {
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

            {!timeslots && <h4 className={'user-message'}><Loader
                type="TailSpin"
                color="#00BFFF"
                height={'30px'}
                width={'30px'}/>Dáta sa načítavajú</h4>
            }

            <div className="form-control-check">
                <h3 id={"reservation-page-title"} className={'title'}
                    style={{fontSize: !isMobile ? "1.5rem" : "2rem"}}>Rozpis</h3>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: "flex-end",
                    border: "1px solid black",
                    padding: '5px'
                }}>
                    <div>
                        <label>Typ zobrazenia</label>
                    </div>
                    <div style={{display:'flex',alignItems:'center'}}>
                        <input type="radio" value={VIEW_MODES.ONEDAY} name="view-mode-one-day"
                               checked={viewMode === VIEW_MODES.ONEDAY} onChange={(e) => onViewModeChanged(e)}/> <span
                        style={{marginRight: '5px'}}>1 deň</span>
                        <input type="radio" value={VIEW_MODES.FIVEDAYS} name="view-mode-five-days"
                               checked={viewMode === VIEW_MODES.FIVEDAYS} onChange={(e) => onViewModeChanged(e)}/>
                        <span>14 dní</span>
                    </div>

                </div>
            </div>

            {error && <UserMessage message={error} color={'indianred'}/>}
            {reservationStatus && <h4 className={'user-message'}>{reservationStatus}</h4>}

            {timeslots && viewMode === VIEW_MODES.ONEDAY && <div className='form-control'>
                <label>Dátum rezervácie</label>

                <select ref={selectedDateSelectBox} onChange={(e) => onReservationDateChanged(e)}>
                    <>
                        {datesForReservation.map((uniqueDate, index) => {
                            return <option key={index}>{uniqueDate}</option>
                        })}</>
                </select>
            </div>}


            {timeslots && viewMode === VIEW_MODES.ONEDAY &&
            <Timetable timeslots={timeslotsPerDay} onSelected={onTimeslotSelected}
                       reservedslots={reservedSlotsPerDay}/>}

            {timeslots && viewMode === VIEW_MODES.FIVEDAYS &&
            datesForReservation.map((date, index) => {
                    return <div style={{marginBottom: '10px'}}>
                        <h4>{date}</h4>
                        <Timetable timeslots={timeslotsArray[index]}
                                   onSelected={onTimeslotSelected}
                                   reservedslots={reservedSlotsArray[index]}/></div>
            })
            }


            <Modal isOpen={selectedTimeslot !== null} style={MODAL_CUSTOM_STYLES}
                   appElement={document.getElementById('main-pane')}>
                <FontAwesomeIcon onClick={closeModal} icon={faWindowClose} style={{marginRight: '5px', cursor: 'pointer'}}/>
                {selectedTimeslot && !TimeslotService.isSlotReserved(selectedTimeslot) &&
                <div className="containerTimeslotForm">
                    <div className="form-control-check" onChange={(e) => onReservationTypeChanged(e)}>
                        <label>Typ rezervácie</label>
                        <input type="radio" value={RESERVATION_TYPES.ONETIME} name="reservation-type"
                               checked={reservationType === RESERVATION_TYPES.ONETIME}/> Jednorázová
                        <input type="radio" value={RESERVATION_TYPES.LONGTERM} name="reservation-type"
                               checked={reservationType === RESERVATION_TYPES.LONGTERM}/> Dlhodobá
                    </div>
                </div>}
                {selectedTimeslot && reservationType === RESERVATION_TYPES.ONETIME &&
                <OneTimeReservationForm timeslots={timeslotsPerDay} selectedTimeslot={selectedTimeslot}
                                        onReservation={onReservation} onEndTimeChange={onEndTimeChange}
                                        reservedTimeslots={reservedSlots}/>}
                {selectedTimeslot && !TimeslotService.isSlotReserved(selectedTimeslot) && reservationType === RESERVATION_TYPES.LONGTERM &&
                <LongtermReservationForm timeslots={timeslotsPerDay} selectedTimeslot={selectedTimeslot}
                                         onReservation={onLongtermReservation} onEndTimeChange={onEndTimeChange}
                                         reservedTimeslots={reservedSlots}/>}
            </Modal>


        </div>
    );
}

Reservation.propTypes = {};

export default Reservation;
