const TimeslotService = {
    removeFromReservedTimeslots: function (timeslots, slotIdsToRemove) {
        let groupedTimeslots = {}
        Object.keys(timeslots).forEach(courtNo => {
            groupedTimeslots[courtNo] = timeslots[courtNo].filter((timeslotArray) => {
                let timeslotIds = timeslotArray.map(slot => slot.slotId);
                let timeslotArrayShouldBeRemoved = false
                slotIdsToRemove.forEach(slotIdToRemove => {
                    if (timeslotIds.includes(slotIdToRemove)) {
                        timeslotArrayShouldBeRemoved = true;
                    }
                })
                return !timeslotArrayShouldBeRemoved;
            });
            if (groupedTimeslots[courtNo].length === 0) {
                delete groupedTimeslots[courtNo];
            }
        })
        return groupedTimeslots
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
    getVacantSlotsAfterSelectedTimeslot: function (timeslots, selectedTimeslot) {
        const timeslotsForSelectedDay = this.getTimeslotsByDateAndCourt(timeslots, new Date(selectedTimeslot.startTime), selectedTimeslot.courtnumber);
        let vacantSlotsAfterSelectedTimeslot = []
        let vacantSlotFound = false;
        for (let i = 0; i < timeslotsForSelectedDay.length; i++) {
            if (vacantSlotFound && timeslotsForSelectedDay[i].userAccount != null) {
                break;
            }
            if (timeslotsForSelectedDay[i].slotId >= selectedTimeslot.slotId) {
                vacantSlotsAfterSelectedTimeslot.push(timeslotsForSelectedDay[i]);
                vacantSlotFound = true;
            }
        }
        return vacantSlotsAfterSelectedTimeslot;
    },
    getMyReservedSlotsAfterSelectedTimeslot: function (timeslots, selectedTimeslot, myUserId) {
        const timeslotsForSelectedDay = this.getTimeslotsByDateAndCourt(timeslots, new Date(selectedTimeslot.startTime), selectedTimeslot.courtnumber);
        let reservedByUserSlotsAfterSelectedTimeslot = []
        let reservedByUserSlotFound = false;
        for (let i = 0; i < timeslotsForSelectedDay.length; i++) {
            if (reservedByUserSlotFound && (!this.isSlotReserved(timeslotsForSelectedDay[i]) || myUserId !== timeslotsForSelectedDay[i].userAccount.userId)) {
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
        return `${date.getHours() + 1}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
    },
    formatDate: function (date) {
        return `${date.getDate()}.${date.getMonth() + 1} ${date.getHours() + 1}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
    },
    isSlotReserved: function (timeslot) {
        return timeslot.userAccount != null;
    }


}
export default TimeslotService;
