import React, {Component, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {accountService} from "../services/auth/AuthService";
import UserReservationSummary from "../components/UserReservationSummary";
import TimeslotService from "../services/TimeslotService";
import Loader from "react-loader-spinner";
import {useNavigate} from "react-router-dom";
import UserMessage from "../components/UserMessage";
import * as Constants from "constants";
import {BACKEND_BASE_URL} from "../services/Constants";

const MyReservations = () => {
    const navigate = useNavigate();
    const [reservedTimeslots, setReservedTimeslots] = useState({});
    const [userMessage, setUserMessage] = useState(null);
    const [timeslotsFromBackend, setTimeslotsFromBackend] = useState({});
    const [showSpinner, setShowSpinner] = useState(false);
    const [error, setError] = useState(null);
    const [empty, setEmpty] = useState(false);

    function loadUserReservations() {
        const getTimetableData = async () => {
            await fetch(`${BACKEND_BASE_URL}/timeslots/user/${accountService.accountValue.userId}`)
                .then(res => res.json())
                .then(timeslotsFromServer => {
                        //setTimeslotsFromBackend(timeslotsFromServer);
                        const groupedTimeslots = TimeslotService.groupReservedTimeslots(timeslotsFromServer);
                        if (Object.keys(groupedTimeslots).length == 0) {
                            setEmpty(true)
                        } else {
                            setReservedTimeslots(groupedTimeslots)
                        }
                    }
                ).catch(error => {
                    setError(error);
                    console.log(error)
                })
        }
        getTimetableData();
    }

    const cancelReservation = (slots) => {

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
                    if (Object.keys(remainingtimeslots).length == 0) {
                        setEmpty(true)
                    }
                    setUserMessage(`Rezervácia dvorca ${data[0].courtnumber} od ${TimeslotService.formatDate(new Date(data[0].startTime))} do ${TimeslotService.formatDate(new Date(data[data.length - 1].endTime))} bola zrušená.`);
                }
            ).catch(error => {
            setError(error);
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
            <h3>Moje rezervácie</h3>
            {error && <UserMessage message={error} color={'indianred'}/>}
            {(userMessage || showSpinner) && <div className={'user-message'}>
                {showSpinner && <Loader
                    type="TailSpin"
                    color="#00BFFF"
                    height={'30px'}
                    width={'30px'}
                />}
                {showSpinner ? 'Prebieha rušenie rezervácie' : userMessage}</div>}
            {Object.keys(reservedTimeslots).length > 0 &&
            <UserReservationSummary reservedTimeslots={reservedTimeslots} onCancellation={cancelReservation}/>}
            {empty && <p>Nemáte zadanú žiadnu rezerváciu.</p>}
        </div>
    );
}


MyReservations.propTypes = {};

export default MyReservations;