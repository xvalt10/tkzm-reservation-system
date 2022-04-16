import React, {useEffect, useState} from 'react';
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

const MyReservations = () => {
    const navigate = useNavigate();
    const [reservationToCancel, setReservationToCancel] = useState(null);
    const [longtermReservations, setLongtermReservations] = useState(null);
    const [reservedTimeslots, setReservedTimeslots] = useState(null);
    const [userMessage, setUserMessage] = useState(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [error, setError] = useState(null);
    const [oneTimeReservationsEmpty, setOneTimeReservationsEmpty] = useState(false);
    const [longtermReservationsEmpty, setLongtermReservationsEmpty] = useState(false);

    function loadUserReservations() {
        const getTimetableData = async () => {
            await fetch(`${BACKEND_BASE_URL}/timeslots/user/${accountService.accountValue.name}/orderedByStartTime`)
                .then(res => res.json())
                .then(timeslotsFromServer => {
                        if (Object.keys(timeslotsFromServer).length === 0) {
                            setOneTimeReservationsEmpty(true)
                            setReservedTimeslots([]);
                        } else {
                            timeslotsFromServer.forEach(timeslot => {
                                timeslot.startTime = new Date(timeslot.startTime).toString();
                                timeslot.endTime = new Date(timeslot.endTime).toString();
                            });
                            setReservedTimeslots(timeslotsFromServer)
                            console.log(timeslotsFromServer);
                        }
                        TimeslotService.getReservationCountValueSubject().next(timeslotsFromServer.length);
                    }
                ).catch(error => {
                    setError(error.message);
                    console.log(error)
                });

            await fetch(`${BACKEND_BASE_URL}/timeslots/longterm/user/${accountService.accountValue.name}`)
                .then(res => res.json())
                .then(longtermReservationsFromServer => {
                        console.log(longtermReservationsFromServer);
                        if (longtermReservationsFromServer.length === 0) {
                            setLongtermReservations([]);
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

    const openCancellationModal = (reservationType, reservationData) => {
        const reservation = JSON.parse(reservationData);
        setReservationToCancel({'type': reservationType, 'reservationData': reservation});
        // if (reservationType === RESERVATION_TYPES.LONGTERM) {
        //     setReservationToCancel(reservation);
        // } else {
        //     setSlotsToCancel(reservation);
        //     setSlotIdsToCancel(reservation.map(slot=>slot.slotId));
        // }
    }

    const cancelLongTermReservation = () => {
        setReservationToCancel(null);
        const requestOptions = {
            method: 'PUT'
        };
        setShowSpinner(true)
        const backendURL = `${BACKEND_BASE_URL}/timeslots/cancel/longterm/${reservationToCancel.reservationData.id}`;
        fetch(backendURL, requestOptions)
            .then(response => response.json())
            .then(canceledSlots => {
                    if (canceledSlots.error) {
                        setError(canceledSlots.message);
                    } else {
                        console.log(canceledSlots);
                        setShowSpinner(false);

                        const remainingtimeslots = TimeslotService.removeFromReservedTimeslots(reservedTimeslots, canceledSlots);
                        console.log(remainingtimeslots);
                        //TimeslotService.getReservationCountValueSubject().next(TimeslotService.countGroupedTimeslots(remainingtimeslots));
                        TimeslotService.getReservationCountValueSubject().next(remainingtimeslots.length);
                        setReservedTimeslots(remainingtimeslots);
                        if (Object.keys(remainingtimeslots).length === 0) {
                            setOneTimeReservationsEmpty(true)
                        }
                        const remainingLongtermReservations = longtermReservations.filter(reservation2 => reservation2.id !== reservationToCancel.reservationData.id);
                        setLongtermReservations(remainingLongtermReservations);
                        if (remainingLongtermReservations.length === 0) {
                            setLongtermReservationsEmpty(true);
                        }

                        setUserMessage(`Dlhodobá rezervácia dvorca ${reservationToCancel.reservationData.courtNumber} ${TimeslotService.formatDateLongTermReservationLong(reservationToCancel.reservationData)} bola zrušená.`);
                    }
                }
            ).catch(error => {
            setError(error.message);
            console.log(error)
        })

    }
    const cancelOnetimeReservation = () => {
        const requestOptions = {
            method: 'PUT'
        };
        setShowSpinner(true)
        const backendURL = `${BACKEND_BASE_URL}/timeslots/cancel/onetime/${reservationToCancel.reservationData.slotId}`;
        fetch(backendURL, requestOptions)
            .then(response => response.json())
            .then(canceledReservation => {
                    setShowSpinner(false);
                    if (canceledReservation) {
                        const remainingtimeslots = reservedTimeslots.filter(reservedSlot => reservedSlot.slotId !== canceledReservation.slotId);
                        setReservedTimeslots(remainingtimeslots);
                        TimeslotService.getReservationCountValueSubject().next(TimeslotService.getReservationCountValueSubject().value - 1);
                        if (Object.keys(remainingtimeslots).length === 0) {
                            setOneTimeReservationsEmpty(true)
                        }
                        setUserMessage(`Rezervácia dvorca ${canceledReservation.courtnumber} od ${TimeslotService.formatDate(new Date(canceledReservation.startTime))} do ${TimeslotService.formatDate(new Date(canceledReservation.endTime))} bola zrušená.`);
                    }
                }
            ).catch(error => {
            setError(error.message);
            console.log(error)
        })
        setReservationToCancel(null);
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
            {!reservedTimeslots && <h4 className={'user-message'}><Loader
                type="TailSpin"
                color="#00BFFF"
                height={'30px'}
                width={'30px'}/>Dáta sa načítavajú</h4>
            }
            {error && <UserMessage message={error} color={'indianred'}/>}
            {(userMessage || showSpinner) && <div className={'user-message'}>
                {showSpinner && <Loader
                    type="TailSpin"
                    color="#00BFFF"
                    height={'30px'}
                    width={'30px'}
                />}
                {showSpinner ? 'Prebieha rušenie rezervácie' : userMessage}</div>}


            <OneTimeReservationTable reservedTimeslots={reservedTimeslots} onCancellation={openCancellationModal}/>
            <LongtermReservationTable longtermReservations={longtermReservations}
                                      onCancellation={openCancellationModal}/>


            {reservationToCancel &&
            <Modal isOpen={reservationToCancel.type === RESERVATION_TYPES.LONGTERM} style={MODAL_CUSTOM_STYLES}
                   appElement={document.getElementById('main-pane')}>

                <div className={'flexVerticalDivCentered'}>
                    <FontAwesomeIcon onClick={() => {
                        setReservationToCancel(null);
                    }} icon={faWindowClose} style={{margin: '5px', cursor: 'pointer', alignSelf: 'end'}}/>
                    <span
                        className={'is-spaced'}>{`Naozaj chcete zrušiť dlhodobú rezerváciu dvorca ${reservationToCancel.reservationData.courtNumber} ${TimeslotService.formatDateLongTermReservationLong(reservationToCancel.reservationData)}?`}</span>
                    <button className="button is-rounded is-info" onClick={cancelLongTermReservation}>Potvrdzujem
                        zrušenie
                    </button>
                </div>


            </Modal>}

            {reservationToCancel &&
            <Modal isOpen={reservationToCancel.type === RESERVATION_TYPES.ONETIME} style={MODAL_CUSTOM_STYLES}
                   appElement={document.getElementById('main-pane')}>

                <div className={'flexVerticalDivCentered'}>
                    <FontAwesomeIcon onClick={() => {
                        setReservationToCancel(null);
                    }} icon={faWindowClose} style={{margin: '5px', cursor: 'pointer', alignSelf: 'end'}}/>
                    <span
                        className={'is-spaced'}>{`Naozaj chcete zrušiť rezerváciu dvorca ${reservationToCancel.reservationData.courtnumber} od ${TimeslotService.formatDate(new Date(reservationToCancel.reservationData.startTime))} do ${TimeslotService.formatDate(new Date(reservationToCancel.reservationData.endTime))}?`}</span>
                    <button className="button is-rounded is-info" onClick={cancelOnetimeReservation}>Potvrdzujem
                        zrušenie
                    </button>
                </div>


            </Modal>}
        </div>
    );
}

MyReservations.propTypes = {};

export default MyReservations;