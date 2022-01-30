import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {accountService} from "../services/auth/AuthService";
import OneTimeReservationTable from "../components/OneTimeReservationTable";
import TimeslotService from "../services/TimeslotService";
import Loader from "react-loader-spinner";
import {useNavigate} from "react-router-dom";
import UserMessage from "../components/UserMessage";
import {BACKEND_BASE_URL, MODAL_CUSTOM_STYLES, RESERVATION_TYPES} from "../services/Constants";
import LongtermReservationTable from "../components/LongtermReservationTable";
import Modal from "react-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWindowClose} from "@fortawesome/free-solid-svg-icons";
import OneTimeReservationForm from "../components/OneTimeReservationForm";
import LongtermReservationForm from "../components/LongtermReservationForm";

const MyReservations = () => {
    const navigate = useNavigate();
    const [slotsToCancel, setSlotsToCancel] = useState(null);
    const [slotIdsToCancel, setSlotIdsToCancel] = useState(null);
    const [reservationToCancel, setReservationToCancel] = useState(null);
    const [longtermReservations, setLongtermReservations] = useState([]);
    const [reservedTimeslots, setReservedTimeslots] = useState({});
    const [userMessage, setUserMessage] = useState(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [error, setError] = useState(null);
    const [oneTimeReservationsEmpty, setOneTimeReservationsEmpty] = useState(false);
    const [longtermReservationsEmpty, setLongtermReservationsEmpty] = useState(false);

    function loadUserReservations() {
        const getTimetableData = async () => {
            await fetch(`${BACKEND_BASE_URL}/timeslots/user/${accountService.accountValue.name}`)
                .then(res => res.json())
                .then(timeslotsFromServer => {
                        const groupedTimeslots = TimeslotService.groupReservedTimeslots(timeslotsFromServer);
                        if (Object.keys(groupedTimeslots).length === 0) {
                            setOneTimeReservationsEmpty(true)
                        } else {
                            setReservedTimeslots(groupedTimeslots)
                        }
                    TimeslotService.getReservationCountValueSubject().next(TimeslotService.countGroupedTimeslots(groupedTimeslots));
                    }
                ).catch(error => {
                    setError(error.message);
                    console.log(error)
                });

            await fetch(`${BACKEND_BASE_URL}/timeslots/longterm/user/${accountService.accountValue.name}`)
                .then(res => res.json())
                .then(longtermReservationsFromServer => {
                        if (longtermReservationsFromServer.length === 0) {
                            setLongtermReservationsEmpty(true)
                        } else {

                            setLongtermReservations(longtermReservationsFromServer);
                        }
                    }
                ).catch(error => {
                    setError(error.message);
                    console.log(error)
                });
        }
        getTimetableData();
    }

    const openCancellationModal = (reservationType,reservationData) => {
        const reservation = JSON.parse(reservationData);
        if (reservationType === RESERVATION_TYPES.LONGTERM) {
            setReservationToCancel(reservation);
        } else {
            setSlotsToCancel(reservation);
            setSlotIdsToCancel(reservation.map(slot=>slot.slotId));
        }
    }

    const cancelLongTermReservation = () => {
        setReservationToCancel(null);
        const requestOptions = {
            method: 'PUT'
        };
        setShowSpinner(true)
        const backendURL = `${BACKEND_BASE_URL}/timeslots/cancel/${reservationToCancel.id}`;
        fetch(backendURL, requestOptions)
            .then(response => response.json())
            .then(data => {
                    console.log(data);
                    setShowSpinner(false);
                    const slotIdsToCancel = data.map(slot => slot.slotId);
                    const remainingtimeslots = TimeslotService.removeFromReservedTimeslots(reservedTimeslots, slotIdsToCancel);

                    TimeslotService.getReservationCountValueSubject().next(TimeslotService.countGroupedTimeslots(remainingtimeslots));
                    setReservedTimeslots(remainingtimeslots);
                    if (Object.keys(remainingtimeslots).length === 0) {
                        setOneTimeReservationsEmpty(true)
                    }
                    const remainingLongtermReservations = longtermReservations.filter(reservation2 => reservation2.id !== reservationToCancel.id);
                    setLongtermReservations(remainingLongtermReservations);
                    if(remainingLongtermReservations.length === 0 ){
                        setLongtermReservationsEmpty(true);
                    }

                    setUserMessage(`Dlhodobá rezervácia dvorca ${reservationToCancel.courtNumber} ${TimeslotService.formatDateLongTermReservationLong(reservationToCancel)} bola zrušená.`);

                }
            ).catch(error => {
            setError(error.message);
            console.log(error)
        })

    }
    const cancelOnetimeReservation = () => {
        setSlotsToCancel(null);
        setSlotIdsToCancel(null);
        const requestOptions = {
            method: 'PUT',
            body: JSON.stringify(slotIdsToCancel)
        };
        setShowSpinner(true)
        const backendURL = `${BACKEND_BASE_URL}/timeslots/cancel`;
        fetch(backendURL, requestOptions)
            .then(response => response.json())
            .then(data => {
                    setShowSpinner(false);
                    const remainingtimeslots = TimeslotService.removeFromReservedTimeslots(reservedTimeslots, slotIdsToCancel);
                    setReservedTimeslots(remainingtimeslots);
                    TimeslotService.getReservationCountValueSubject().next(TimeslotService.getReservationCountValueSubject().value -1);
                    if (Object.keys(remainingtimeslots).length === 0) {
                        setOneTimeReservationsEmpty(true)
                    }
                    setUserMessage(`Rezervácia dvorca ${data[0].courtnumber} od ${TimeslotService.formatDate(new Date(data[0].startTime))} do ${TimeslotService.formatDate(new Date(data[data.length - 1].endTime))} bola zrušená.`);
                }
            ).catch(error => {
            setError(error.message);
            console.log(error)
        })
    }

    useEffect(() => {
        if (!accountService.accountValue) {
            navigate('/');
        } else {
            loadUserReservations();
        }
    }, [])
    return (
        <div>
            <h3 className="title is-spaced">Moje rezervácie</h3>
            {error && <UserMessage message={error} color={'indianred'}/>}
            {(userMessage || showSpinner) && <div className={'user-message'}>
                {showSpinner && <Loader
                    type="TailSpin"
                    color="#00BFFF"
                    height={'30px'}
                    width={'30px'}
                />}
                {showSpinner ? 'Prebieha rušenie rezervácie' : userMessage}</div>}
            <h4 className={'subtitle'}>Aktuálne rezervácie (najbližších 14 dní)</h4>
            {Object.keys(reservedTimeslots).length > 0 &&
            <OneTimeReservationTable reservedTimeslots={reservedTimeslots} onCancellation={openCancellationModal}/>}
            {oneTimeReservationsEmpty && <p className={'subtitle is-6 is-spaced'}>Nemáte zadanú žiadnu jednorázovú rezerváciu.</p>}
            <h4 className={'subtitle'}>Dlhodobé rezervácie</h4>
            {!longtermReservationsEmpty && <LongtermReservationTable longtermReservations={longtermReservations} onCancellation={openCancellationModal}/>}
            {longtermReservationsEmpty && <p className={'subtitle is-6 is-spaced'}>Nemáte zadanú žiadnu dlhodobú rezerváciu.</p>}

            {reservationToCancel && <Modal isOpen={reservationToCancel !== null} style={MODAL_CUSTOM_STYLES} appElement={document.getElementById('main-pane')}>

                <div className={'flexVerticalDivCentered'}>
                    <FontAwesomeIcon onClick={()=>{setReservationToCancel(null);}} icon={faWindowClose} style={{margin:'5px',cursor:'pointer',alignSelf:'end'}}/>
                    <span className={'is-spaced'}>{`Naozaj chcete zrušiť dlhodobú rezerváciu dvorca ${reservationToCancel.courtNumber} ${TimeslotService.formatDateLongTermReservationLong(reservationToCancel)}?`}</span>
                    <button className="button is-rounded is-info" onClick={cancelLongTermReservation}>Potvrdzujem zrušenie</button>
                </div>


            </Modal>}

            {slotIdsToCancel && <Modal isOpen={slotIdsToCancel !== null} style={MODAL_CUSTOM_STYLES} appElement={document.getElementById('main-pane')}>

                <div className={'flexVerticalDivCentered'}>
                    <FontAwesomeIcon onClick={()=>{setSlotIdsToCancel(null);}} icon={faWindowClose} style={{margin:'5px',cursor:'pointer',alignSelf:'end'}}/>
                    <span className={'is-spaced'}>{`Naozaj chcete zrušiť rezerváciu dvorca ${slotsToCancel[0].courtnumber} od ${TimeslotService.formatDate(new Date(slotsToCancel[0].startTime))} do ${TimeslotService.formatDate(new Date(slotsToCancel[slotsToCancel.length - 1].endTime))}?`}</span>
                    <button className="button is-rounded is-info" onClick={cancelOnetimeReservation}>Potvrdzujem zrušenie</button>
                </div>


            </Modal>}
        </div>
    );
}

MyReservations.propTypes = {};

export default MyReservations;