import {BehaviorSubject} from "rxjs";
import {RESERVATION_PARAMS} from "./Constants";

const reservationCountSubject = new BehaviorSubject(0);

const TimeslotService = {
    getReservationCountObservable: function () {
        return reservationCountSubject.asObservable();
    },
    getReservationCountValueSubject: function () {
        return reservationCountSubject;
    },
    removeFromReservedTimeslots: function (reservations, slotsToRemove) {
        let slotIdsToRemove = slotsToRemove.map(slot => slot.slotId);

        return reservations.filter(timeslot => {
                return !slotIdsToRemove.includes(timeslot.slotId);
            }
        );
    },
    countReservationsByUser: function (timeslots, myusername) {
        let filteredTimeslots = {}

        Object.keys(timeslots).forEach(courtNo => {
            filteredTimeslots[courtNo] = [];
            timeslots[courtNo].forEach(timeslot => {
                if (timeslot.username === myusername)
                    filteredTimeslots[courtNo].push(timeslot);
            });
        });

        return this.countTimeslots(this.groupReservedTimeslots(filteredTimeslots));
    },
    groupReservedTimeslots: function (timeslots) {
        let groupedTimeslots = {}
        let slotIdsForCurrentReservation = []
        Object.keys(timeslots).forEach(courtNo => {
            groupedTimeslots[courtNo] = [];
            timeslots[courtNo].forEach(timeslot => {
                if (slotIdsForCurrentReservation.length === 0 ||
                    timeslot.startTime === slotIdsForCurrentReservation[slotIdsForCurrentReservation.length - 1].endTime) {
                    slotIdsForCurrentReservation.push(timeslot);
                } else {
                    groupedTimeslots[courtNo].push(slotIdsForCurrentReservation);
                    slotIdsForCurrentReservation = [timeslot];
                }
            });
            if (slotIdsForCurrentReservation.length > 0) {
                groupedTimeslots[courtNo].push(slotIdsForCurrentReservation);
            }
            slotIdsForCurrentReservation = [];
        })
        return groupedTimeslots
    },
    countTimeslots: function (timeslots) {
        let counter = 0;
        Object.keys(timeslots).forEach(courtNo => {
            timeslots[courtNo].forEach(timeslotArray => {
                counter++;
            })
        });
        return counter;
    },
    getTimeslotsByDayMonth: function (timeslots, day, month) {
        let filteredTimeslots = {}
        Object.keys(timeslots).forEach(courtNo => {
            filteredTimeslots[courtNo] = timeslots[courtNo].filter((timeslot) => {
                const timeslotDate = new Date(timeslot.startTime);
                const timeslotDayOfMonth = timeslotDate.getDate();
                const timeslotMonth = timeslotDate.getMonth();
                return day === timeslotDayOfMonth && month - 1 === timeslotMonth;
            });
        })
        return filteredTimeslots;
    },
    markTimeslots: function (timeslots, timeslotIdsToMark) {
        let filteredTimeslots = {}
        Object.keys(timeslots).forEach(courtNo => {
            filteredTimeslots[courtNo] = timeslots[courtNo].map(timeslot => {
                if (!timeslotIdsToMark.includes(timeslot.slotId)) {
                    timeslot.selected = false;
                    return timeslot;
                } else {
                    timeslot.selected = true;
                    return timeslot
                }

            });
        })
        return filteredTimeslots;
    },
    getTimeslotsByIds: function (timeslots, slotIds) {
        let timeslotsFound = []
        Object.keys(timeslots).forEach(courtNo => {
            timeslots[courtNo] = timeslots[courtNo].map(timeslot => {
                if (slotIds.includes(timeslot.slotId)) {
                    timeslotsFound.push(timeslot);
                }

            });
        })
        return timeslotsFound;
    },
    getTimeslotsByDateAndCourt: function (timeslots, date, courtNo) {
        return timeslots[courtNo].filter((timeslot) => {
            const timeslotdate = new Date(timeslot.startTime);
            const dayOfMonth = timeslotdate.getDate();
            const month = timeslotdate.getMonth();
            return date.getDate() === dayOfMonth && date.getMonth() === month;
        });
    },
    getTimeslotIdsForTimeRange: function (timeslots, courtNo, startDateTime, endDateTime) {
        let timeslotIdsForTimeRange = [];
        timeslots[courtNo].forEach((timeslot) => {
            const timeslotStartDateTime = new Date(timeslot.startTime);
            const timeslotEndDateTime = new Date(timeslot.endTime);
            const dayOfMonth = timeslotStartDateTime.getDate();
            const month = timeslotStartDateTime.getMonth();
            if (startDateTime.getDate() === dayOfMonth &&
                startDateTime.getMonth() === month &&
                timeslotStartDateTime.getTime() >= startDateTime.getTime() &&
                timeslotEndDateTime.getTime() <= endDateTime.getTime()
            ) {
                timeslotIdsForTimeRange.push(timeslot.slotId)
            }
        });
        return timeslotIdsForTimeRange;
    },
    getSlotsAfterSelectedTimeslot: function(timeslots, selectedTimeslot) {
        const timeslotsForSelectedDay = this.getTimeslotsByDateAndCourt(timeslots, new Date(selectedTimeslot.startTime), selectedTimeslot.courtnumber);
        let startIndex = null;
        for (let i = 0; i < timeslotsForSelectedDay.length; i++) {
            if (timeslotsForSelectedDay[i].slotId === selectedTimeslot.slotId) {
                startIndex = i;
                break;
            }
        }
        return timeslotsForSelectedDay.slice(startIndex);
    },
    getVacantSlotsAfterSelectedTimeslot: function (timeslots, reservedTimeslots, selectedTimeslot) {
        const timeslotsForSelectedDay = this.getTimeslotsByDateAndCourt(timeslots, new Date(selectedTimeslot.startTime), selectedTimeslot.courtnumber);
        let vacantSlotsAfterSelectedTimeslot = []
        let vacantSlotFound = false;
        for (let i = 0; i < timeslotsForSelectedDay.length; i++) {
            if (vacantSlotFound && !this.isGeneratedSlotVacant(timeslotsForSelectedDay[i], reservedTimeslots)) {
                break;
            }
            if (timeslotsForSelectedDay[i].slotId >= selectedTimeslot.slotId) {
                vacantSlotsAfterSelectedTimeslot.push(timeslotsForSelectedDay[i]);
                vacantSlotFound = true;
            }
        }
        return vacantSlotsAfterSelectedTimeslot;
    },
    isGeneratedSlotVacant: function (timeslot, reservedTimeslots) {
        let slotVacant = true;
        Object.keys(reservedTimeslots).forEach(courtNumber => {
            reservedTimeslots[courtNumber].forEach(reservedSlot => {
                const timeslotStartDateTime = new Date(timeslot.startTime);
                const timeslotEndDateTime = new Date(timeslot.endTime);
                const reservedslotStartDateTime = new Date(reservedSlot.startTime);
                const reservedslotEndDateTime = new Date(reservedSlot.endTime);

                if (reservedSlot.courtnumber === timeslot.courtnumber &&
                    reservedslotStartDateTime.getDate() === timeslotStartDateTime.getDate() &&
                    reservedslotStartDateTime.getMonth() === timeslotStartDateTime.getMonth() &&
                    timeslotStartDateTime.getTime() >= reservedslotStartDateTime.getTime() &&
                    timeslotEndDateTime.getTime() <= reservedslotEndDateTime.getTime()
                ) {
                    slotVacant = false
                }
            });
        })
        return slotVacant;
    },

    getMyReservedSlotsAfterSelectedTimeslot: function (timeslots, selectedTimeslot, myUsername) {
        const timeslotsForSelectedDay = this.getTimeslotsByDateAndCourt(timeslots, new Date(selectedTimeslot.startTime), selectedTimeslot.courtnumber);
        let reservedByUserSlotsAfterSelectedTimeslot = []
        let reservedByUserSlotFound = false;
        for (let i = 0; i < timeslotsForSelectedDay.length; i++) {
            if (reservedByUserSlotFound && (!this.isSlotReserved(timeslotsForSelectedDay[i]) || myUsername !== timeslotsForSelectedDay[i].username)) {
                break;
            }
            if (timeslotsForSelectedDay[i].slotId >= selectedTimeslot.slotId) {
                reservedByUserSlotsAfterSelectedTimeslot.push(timeslotsForSelectedDay[i]);
                reservedByUserSlotFound = true;
            }
        }
        return reservedByUserSlotsAfterSelectedTimeslot;
    },
    getTimerangeForSlot:
        function (timeslot) {
            const startDate = new Date(timeslot.startTime);
            const endDate = new Date(timeslot.endTime);
            return `${this.formatDateShort(startDate)}-${this.formatDateShort(endDate)}`
        },
    formatDateShort: function (date) {
        return `${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
    },
    getDayOfWeek: function (date) {
        return date.toLocaleDateString("sk-SK", {weekday: 'long'});
    },
    formatDateMonthDay: function (date) {
        date = new Date(Date.parse(date))
        return `${date.getDate()}.${date.getMonth() + 1}.`
    },
    formatDate: function (date) {
        const utcOffset = date.getTimezoneOffset();
        const hours = date.getUTCHours() - utcOffset/60;
        return `${date.getDate()}.${date.getMonth() + 1} ${hours}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
    },
    formatDateLongTermReservation: function (date, hoursInUTC, minutes, dayofweek) {
        const utcOffset = new Date().getTimezoneOffset();
        const hours = hoursInUTC - utcOffset / 60;
        if (!isNaN(dayofweek)) {
            const daysOfWeek = ['pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota', 'nedeľa']
            dayofweek = daysOfWeek[dayofweek - 1]
        }
        return `${dayofweek} ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    },
    formatDateLongTermReservationLong: function (reservation) {
        const utcOffset = new Date(reservation.startDate).getTimezoneOffset();
        const startHour = reservation.startHour - utcOffset / 60 ;
        const endHour = reservation.endHour - utcOffset / 60;
        let dayofweek;
        if (!isNaN(reservation.dayOfWeek)) {
            const daysOfWeek = ['pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota', 'nedeľa']
            dayofweek = daysOfWeek[reservation.dayOfWeek - 1]
        }
        return `${dayofweek} ${startHour}:${reservation.startMinutes < 10 ? '0' + reservation.startMinutes : reservation.startMinutes}-${endHour}:${reservation.endMinutes < 10 ? '0' + reservation.endMinutes : reservation.endMinutes} od ${TimeslotService.formatDateMonthDay(reservation.startDate)} do ${TimeslotService.formatDateMonthDay(reservation.endDate)}`;
    },

    isSlotReserved: function (timeslot) {
        return timeslot.username != null;
    },


    generateTimetableData: function (startDate, startHour, endHour, noOfDays, noOfCourts) {
        let timeslotStartDateTime;
        let timeslotEndDateTime;
        let timetableData = {}
        let formattedDates = []
        let timeslots = {}
        let slotId = 1;
        let currentDate;
        Date.prototype.addDays = function (days) {
            let date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
        for (let court = 1; court <= noOfCourts; court++) {
            timeslots[court] = [];
            currentDate = startDate;
            for (let day = 1; day <= noOfDays; day++) {
                if (court === 1) {
                    formattedDates.push(currentDate);
                }
                for (let hour = startHour; hour < endHour; hour++) {
                    timeslotStartDateTime = new Date(currentDate);
                    timeslotStartDateTime.setHours(hour, 0, 0, 0);
                    timeslotEndDateTime = new Date(currentDate);
                    timeslotEndDateTime.setHours(hour, 30, 0, 0);

                    timeslots[court].push({
                        courtnumber: court,
                        dayOfWeek: timeslotStartDateTime.getDay(),
                        startTime: timeslotStartDateTime.toISOString(),
                        endTime: timeslotEndDateTime.toISOString(),
                        username: null,
                        price: null,
                        slotId: slotId++
                    })

                    timeslotStartDateTime = new Date(currentDate);
                    timeslotStartDateTime.setHours(hour, 30, 0, 0);
                    timeslotEndDateTime = new Date(currentDate);
                    timeslotEndDateTime.setHours(hour + 1, 0, 0, 0);

                    timeslots[court].push({
                        courtnumber: court,
                        dayOfWeek: timeslotStartDateTime.getDay(),
                        startTime: timeslotStartDateTime.toISOString(),
                        endTime: timeslotEndDateTime.toISOString(),
                        description: null,
                        username: null,
                        price: null,
                        slotId: slotId++
                    })
                }
                currentDate = currentDate.addDays(1);
            }


        }

        timetableData.timeslots = timeslots;
        timetableData.dates = formattedDates;
        return timetableData;

    },
    addReservedTimeslotsToTimetable: function (generatedSlots, reservedSlots) {
        Object.keys(reservedSlots).forEach(courtNumber => {
            reservedSlots[courtNumber].forEach(reservedSlot => {
                generatedSlots[courtNumber].forEach((timeslot) => {
                    const timeslotStartDateTime = new Date(timeslot.startTime);
                    const timeslotEndDateTime = new Date(timeslot.endTime);
                    const reservedslotStartDateTime = new Date(reservedSlot.startTime);
                    const reservedslotEndDateTime = new Date(reservedSlot.endTime);

                    if (reservedslotStartDateTime.getDate() === timeslotStartDateTime.getDate() &&
                        reservedslotStartDateTime.getMonth() === timeslotStartDateTime.getMonth() &&
                        timeslotStartDateTime.getTime() >= reservedslotStartDateTime.getTime() &&
                        timeslotEndDateTime.getTime() <= reservedslotEndDateTime.getTime()
                    ) {
                        timeslot.username = reservedSlot.username;
                    }
                });
            });
        })
    },
    addColumnAndRowToReservedSlots: function (reservedslots) {
        Object.keys(reservedslots).forEach(courtNumber => {
            reservedslots[courtNumber].forEach(slot => {
                const utcOffset = new Date(slot.startTime).getTimezoneOffset();
                const startHours = new Date(slot.startTime).getUTCHours() - utcOffset/60;
                const startMinutes = new Date(slot.startTime).getMinutes();
                const endHours = new Date(slot.endTime).getUTCHours() - utcOffset/60;
                const endMinutes = new Date(slot.endTime).getMinutes();
                slot.row = slot.courtnumber + 1;
                slot.column = (startHours - RESERVATION_PARAMS.startHour) * 2 + (startMinutes / 30) + 2;
                slot.columnEnd = (endHours - RESERVATION_PARAMS.startHour) * 2 + (endMinutes / 30) + 2;
            });
        });
        return reservedslots;
    }


}
export default TimeslotService;
