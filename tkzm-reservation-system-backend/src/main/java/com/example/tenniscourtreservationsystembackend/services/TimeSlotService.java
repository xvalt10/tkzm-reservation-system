package com.example.tenniscourtreservationsystembackend.services;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.time.zone.ZoneRules;
import java.util.*;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import com.example.tenniscourtreservationsystembackend.datamanagement.LongtermReservationRepository;
import com.example.tenniscourtreservationsystembackend.datamanagement.TimeSlotRepository;
import com.example.tenniscourtreservationsystembackend.domain.LongtermReservation;
import com.example.tenniscourtreservationsystembackend.domain.Timeslot;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/timeslots")
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final LongtermReservationRepository longtermReservationRepository;
    private ObjectMapper mapper;

    @Autowired
    TimeSlotService(TimeSlotRepository timeSlotRepository, LongtermReservationRepository longtermReservationRepository) {
        this.timeSlotRepository = timeSlotRepository;
        this.longtermReservationRepository = longtermReservationRepository;
        this.mapper = new ObjectMapper();
        this.mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.mapper.registerModule(new JavaTimeModule());

    }

    @RequestMapping(method = RequestMethod.GET)
    private List<Timeslot> getSlotsForLastTwoWeeksSortedById() {
        OffsetDateTime currentDate = OffsetDateTime.now().truncatedTo(ChronoUnit.DAYS);
        return this.timeSlotRepository.findByStartTimeBetween(currentDate, currentDate.plusDays(15)).stream().sorted(Comparator.comparingLong(Timeslot::getSlotId)).collect(Collectors.toList());

    }

    @RequestMapping(method = RequestMethod.GET, value = "/byCourt/startTime/{timestamp}/days/{numberOfDays}")
    private Map<Integer, List<Timeslot>> getTimeSlotsByCourtsForNextNDays(@PathVariable long timestamp, @PathVariable int numberOfDays) {
        OffsetDateTime startDate = OffsetDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.of("UTC")).truncatedTo(ChronoUnit.DAYS);
        return getAllReservationsForNextNDays(startDate, numberOfDays).stream().collect(Collectors.groupingBy(Timeslot::getCourtnumber));
    }

    @RequestMapping(method = RequestMethod.GET, value = "/user/{username}")
    private Map<Integer, List<Timeslot>> getTimeSlotsReservedByUserForLastTwoWeeksGroupedByCourtNo(@PathVariable String username) {
        OffsetDateTime currentDate = OffsetDateTime.now().truncatedTo(ChronoUnit.DAYS);
        return this.timeSlotRepository.findByUsernameAndStartTimeBetweenOrderBySlotId(username, currentDate, currentDate.plusDays(15)).stream().collect(Collectors.groupingBy(Timeslot::getCourtnumber));

    }

    @RequestMapping(method = RequestMethod.GET, value = "/user/{username}/orderedByStartTime")
    private List<Timeslot> getTimeSlotsReservedByUserForLastTwoWeeksOrderedByStartTime(@PathVariable String username) {

        OffsetDateTime currentDate = OffsetDateTime.now().truncatedTo(ChronoUnit.DAYS);
        return this.timeSlotRepository.findByUsernameAndStartTimeBetweenOrderByStartTime(username, currentDate, currentDate.plusDays(15));

    }

    @RequestMapping(method = RequestMethod.GET, value = "/longterm/user/{username}")
    private List<LongtermReservation> getLongtermReservationsByUser(@PathVariable String username) {

        return new ArrayList<>(this.longtermReservationRepository.findByUsernameAndEndDateAfter(username, OffsetDateTime.now().truncatedTo(ChronoUnit.DAYS)));
    }

    public List<Timeslot> getAllReservationsForNextNDays(OffsetDateTime currentDate, int numberOfDays) {
        return this.timeSlotRepository.findByStartTimeBetween(currentDate, currentDate.plusDays(numberOfDays));
    }

    public List<Timeslot> getUserReservationsForNextNDays(OffsetDateTime currentDate, String username, int numberOfDays) {
        return this.timeSlotRepository.findByUsernameAndStartTimeBetween(username, currentDate, currentDate.plusDays(numberOfDays));
    }

    public List<Timeslot> getTimeslotsByLongtermReservation(LongtermReservation longtermReservation) {
        List<Timeslot> slotsForSpecificDayOfWeekAndCourt = timeSlotRepository.findByDayOfWeekAndCourtnumber(longtermReservation.getDayOfWeek(), longtermReservation.getCourtNumber());
        return slotsForSpecificDayOfWeekAndCourt.stream().filter(timeslot -> timeslotDateTimeCoveredByLongtermReservation(longtermReservation, timeslot)
        ).collect(Collectors.toList());

    }

    public boolean timeslotDateTimeCoveredByLongtermReservation(LongtermReservation longtermReservation, Timeslot timeslot) {

       // int hourAdjustmentIfTimezoneChanges = isDaylightSavings(timeslot.getStartTime().toInstant()) ? 0 : 0;
        int timeslotUTCStartHour = timeslot.getStartTime().withOffsetSameInstant(ZoneOffset.UTC).getHour();
        int timeslotUTCEndHour = timeslot.getEndTime().withOffsetSameInstant(ZoneOffset.UTC).getHour();

        return
                (timeslot.getStartTime().isAfter(longtermReservation.getStartDate().withHour(0))
                        && timeslot.getEndTime().isBefore(longtermReservation.getEndDate().withHour(23))) &&
                        (timeslotUTCStartHour > longtermReservation.getStartHour() ||
                                (timeslotUTCStartHour == longtermReservation.getStartHour() &&
                                        timeslot.getStartTime().getMinute() >= longtermReservation.getStartMinutes()))
                        && (timeslotUTCEndHour < longtermReservation.getEndHour() ||
                        (timeslotUTCEndHour == longtermReservation.getEndHour() &&
                                timeslot.getEndTime().getMinute() <= longtermReservation.getEndMinutes()));
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/reserve/{username}")
    public Timeslot makeOneTimeReservation(@RequestBody String slotToReserveAsJson, @PathVariable String username,
                                           HttpServletResponse response) throws JsonProcessingException {

        Timeslot slotToReserve = mapper.readValue(slotToReserveAsJson, Timeslot.class);
        slotToReserve.setStartTime(slotToReserve.getStartTime().truncatedTo(ChronoUnit.MINUTES));
        slotToReserve.setEndTime(slotToReserve.getEndTime().truncatedTo(ChronoUnit.MINUTES));
        slotToReserve.setUsername(username);

        List<Timeslot> collidingReservations = timeSlotRepository.findByCourtnumberAndStartTimeBetween(slotToReserve.getCourtnumber(), slotToReserve.getStartTime(), slotToReserve.getEndTime().minusMinutes(1));
        if (!collidingReservations.isEmpty()) {
            throw new IllegalArgumentException("Rezervácia nebola úspešná lebo jedno z časových okien je už rezervované iným používateľom. Vyberte prosím iný čas rezervácie.");
        } else {
            List<Timeslot> userReservations = timeSlotRepository.findByUsername(username);
            Timeslot slotDirectlyBeforeCurrent = null;
            Timeslot slotDirectlyAfterCurrent = null;
            for (Timeslot existingReservation : userReservations) {
                if (existingReservation.getCourtnumber().equals(slotToReserve.getCourtnumber()) && existingReservation.getEndTime().isEqual(slotToReserve.getStartTime())) {
                    slotDirectlyBeforeCurrent = existingReservation;
                }
                if (existingReservation.getCourtnumber().equals(slotToReserve.getCourtnumber()) && existingReservation.getStartTime().isEqual(slotToReserve.getEndTime())) {
                    slotDirectlyAfterCurrent = existingReservation;
                }
                if (slotDirectlyBeforeCurrent != null & slotDirectlyAfterCurrent != null) break;
            }
            if (slotDirectlyBeforeCurrent == null && slotDirectlyAfterCurrent == null) {
                timeSlotRepository.save(slotToReserve);
            } else if (slotDirectlyBeforeCurrent != null && slotDirectlyAfterCurrent == null) {
                slotDirectlyBeforeCurrent.setEndTime(slotToReserve.getEndTime());
                timeSlotRepository.save(slotDirectlyBeforeCurrent);
            } else if (slotDirectlyBeforeCurrent == null && slotDirectlyAfterCurrent != null) {
                slotDirectlyAfterCurrent.setStartTime(slotToReserve.getStartTime());
                timeSlotRepository.save(slotDirectlyAfterCurrent);
            } else {
                slotDirectlyBeforeCurrent.setEndTime(slotDirectlyAfterCurrent.getEndTime());
                timeSlotRepository.save(slotDirectlyBeforeCurrent);
                timeSlotRepository.delete(slotDirectlyAfterCurrent);
            }
            return slotToReserve;
        }
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/cancel/onetime/{reservationId}")
    public Timeslot cancelOneTimeReservation(@PathVariable Long reservationId,
                                             HttpServletResponse response) throws JsonProcessingException {

        Timeslot timeslot = timeSlotRepository.findById(reservationId).orElseThrow(() -> new IllegalArgumentException("Uvedená rezervácia už bola zrušená."));
        timeSlotRepository.delete(timeslot);
        return timeslot;
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/longterm-reservation/{username}")
    public List<Timeslot> makeLongtermReservation(@RequestBody String reservationParamsJson, @PathVariable String username,
                                                  HttpServletResponse response) throws JsonProcessingException {

        List<Timeslot> reservedTimeslots = new ArrayList<>();
        LongtermReservation longtermReservation = mapper.readValue(reservationParamsJson, LongtermReservation.class);
        longtermReservation.setStartDate(longtermReservation.getStartDate().truncatedTo(ChronoUnit.DAYS));
        longtermReservation.setEndDate(longtermReservation.getEndDate().truncatedTo(ChronoUnit.DAYS));
        longtermReservation.setUsername(username);

        longtermReservationRepository.save(longtermReservation);

        OffsetDateTime reservationStartDate = longtermReservation.getStartDate();
        OffsetDateTime reservationEndDate = longtermReservation.getEndDate();

        while (!reservationStartDate.isAfter(reservationEndDate)) {

            int hourAdjustmentIfTimezoneChanges = !isDaylightSavings(longtermReservation.getStartDate().withHour(longtermReservation.getStartHour()).toInstant()) && isDaylightSavings(reservationStartDate.toInstant()) ? 1 : 0;
            System.out.println(hourAdjustmentIfTimezoneChanges);
            Timeslot timeslot = new Timeslot();
            timeslot.setUsername(username);
            timeslot.setDayOfWeek(reservationStartDate.getDayOfWeek().getValue());
            timeslot.setStartTime(reservationStartDate.withHour(longtermReservation.getStartHour() - hourAdjustmentIfTimezoneChanges).withMinute(longtermReservation.getStartMinutes()));
            timeslot.setEndTime(reservationStartDate.withHour(longtermReservation.getEndHour() - hourAdjustmentIfTimezoneChanges).withMinute(longtermReservation.getEndMinutes()).withOffsetSameLocal(longtermReservation.getEndDate().getOffset()));
            timeslot.setCourtnumber(longtermReservation.getCourtNumber());
            reservedTimeslots.add(timeslot);
            reservationStartDate = reservationStartDate.plusDays(7);

        }

        reservedTimeslots.removeIf(timeslot -> {
            List<Timeslot> collidingReservations = timeSlotRepository.findByCourtnumberAndStartTimeBetween(timeslot.getCourtnumber(), timeslot.getStartTime(), timeslot.getEndTime().minusMinutes(1));
            if (!collidingReservations.isEmpty()) {
                return true;
            } else return false;
        });

        timeSlotRepository.saveAll(reservedTimeslots);

        return reservedTimeslots;
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/cancel/longterm/{reservationId}")
    public List<Timeslot> cancelLongtermReservation(@PathVariable Long reservationId,
                                                    HttpServletResponse response) {

        LongtermReservation longtermReservation = longtermReservationRepository.findById(reservationId).orElseThrow(() -> new IllegalArgumentException("Dlhodobá rezervácia s id " + reservationId + " neexistuje."));
        List<Timeslot> canceledTimeslots = getTimeslotsByLongtermReservation(longtermReservation);
        timeSlotRepository.deleteAll(canceledTimeslots);
        longtermReservationRepository.delete(longtermReservation);
        return canceledTimeslots;
    }

    public boolean isDaylightSavings(Instant instant){
        ZoneRules rules = ZoneId.of("Europe/Paris").getRules();
        return rules.isDaylightSavings(instant);
    }

}
