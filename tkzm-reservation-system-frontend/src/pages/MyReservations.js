import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {accountService} from "../services/auth/AuthService";
import OneTimeReservationTable from "../components/OneTimeReservationTable";
import TimeslotService from "../services/TimeslotService";
import Loader from "react-loader-spinner";
import {useNavigate} from "react-router-dom";
import UserMessage from "../components/UserMessage";
import {BACKEND_BASE_URL} from "../services/Constants";
import LongtermReservationTable from "../components/LongtermReservationTable";

const MyReservations = () => {
    const navigate = useNavigate();
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
    const cancelLongTermReservation = (reservationJSONString) => {

        const reservation = JSON.parse(reservationJSONString);
        const requestOptions = {
            method: 'PUT'
        };
        setShowSpinner(true)
        const backendURL = `${BACKEND_BASE_URL}/timeslots/cancel/${reservation.id}`;
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
                    const remainingLongtermReservations = longtermReservations.filter(reservation2 => reservation2.id !== reservation.id);
                    setLongtermReservations(remainingLongtermReservations);
                    if(remainingLongtermReservations.length === 0 ){
                        setLongtermReservationsEmpty(true);
                    }
                    setUserMessage(`Dlhodobá rezervácia dvorca ${reservation.courtNumber} ${TimeslotService.formatDateLongTermReservationLong(reservation)} bola zrušená.`);
                }
            ).catch(error => {
            setError(error.message);
            console.log(error)
        })

    }
    const cancelOnetimeReservation = (slots) => {

        const slotIdsToCancel = slots.split(",").map(slotIdString => +slotIdString);
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
            <OneTimeReservationTable reservedTimeslots={reservedTimeslots} onCancellation={cancelOnetimeReservation}/>}
            {oneTimeReservationsEmpty && <p className={'subtitle is-6 is-spaced'}>Nemáte zadanú žiadnu jednorázovú rezerváciu.</p>}
            <h4 className={'subtitle'}>Dlhodobé rezervácie</h4>
            {!longtermReservationsEmpty && <LongtermReservationTable longtermReservations={longtermReservations} onCancellation={cancelLongTermReservation}/>}
            {longtermReservationsEmpty && <p className={'subtitle is-6 is-spaced'}>Nemáte zadanú žiadnu dlhodobú rezerváciu.</p>}
        </div>
    );
}

MyReservations.propTypes = {};

export default MyReservations;