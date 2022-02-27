package com.example.tenniscourtreservationsystembackend.services;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
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
    private List<Timeslot> getCurrentTimeslotsSortedById() {
        return this.timeSlotRepository.findByStartTimeAfter(OffsetDateTime.now().truncatedTo(ChronoUnit.DAYS)).stream().sorted(Comparator.comparingLong(Timeslot::getSlotId)).collect(Collectors.toList());

    }

    @RequestMapping(method = RequestMethod.GET, value = "/byCourt")
    private Map<Integer, List<Timeslot>> getTimeSlotsByCourts() {
        return getCurrentTimeslotsSortedById().stream().collect(Collectors.groupingBy(Timeslot::getCourtnumber));

    }

    @RequestMapping(method = RequestMethod.GET, value = "/user/{username}")
    private Map<Integer, List<Timeslot>> getTimeSlotsReservedByUser(@PathVariable String username) {

        return this.timeSlotRepository.findByUsernameAndStartTimeAfterOrderBySlotId(username, OffsetDateTime.now().truncatedTo(ChronoUnit.DAYS)).stream().collect(Collectors.groupingBy(Timeslot::getCourtnumber));

    }

    @RequestMapping(method = RequestMethod.GET, value = "/longterm/user/{username}")
    private List<LongtermReservation> getLongtermReservationsByUser(@PathVariable String username) {

        return new ArrayList<>(this.longtermReservationRepository.findByUsernameAndStartDateAfter(username, OffsetDateTime.now().truncatedTo(ChronoUnit.DAYS)));
    }

    public List<Timeslot> getTimeslotsByLongtermReservation(LongtermReservation longtermReservation) {
        List<Timeslot> slotsForSpecificDayOfWeekAndCourt = timeSlotRepository.findByDayOfWeekAndCourtnumber(longtermReservation.getDayOfWeek(), longtermReservation.getCourtNumber());
        return slotsForSpecificDayOfWeekAndCourt.stream().filter(timeslot -> timeslotDateTimeCoveredByLongtermReservation(longtermReservation, timeslot)
        ).collect(Collectors.toList());

    }

    public boolean timeslotDateTimeCoveredByLongtermReservation(LongtermReservation longtermReservation, Timeslot timeslot) {

        int timeslotUTCStartHour = timeslot.getStartTime().withOffsetSameInstant(ZoneOffset.UTC).getHour();
        int timeslotUTCEndHour = timeslot.getEndTime().withOffsetSameInstant(ZoneOffset.UTC).getHour();

        return
        (timeslot.getStartTime().isAfter(longtermReservation.getStartDate().withHour(0))
                && timeslot.getEndTime().isBefore(longtermReservation.getEndDate().withHour(23))) &&
                (timeslotUTCStartHour > longtermReservation.getStartHour() ||
                        (timeslotUTCStartHour == longtermReservation.getStartHour() &&
                                timeslot.getStartTime().getMinute() >= longtermReservation.getStartMinutes()))
                        && (timeslotUTCEndHour < longtermReservation.getEndHour() ||
                        (timeslotUTCEndHour== longtermReservation.getEndHour() &&
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
            for(Timeslot existingReservation: userReservations){
                if(existingReservation.getCourtnumber().equals(slotToReserve.getCourtnumber()) && existingReservation.getEndTime().isEqual(slotToReserve.getStartTime())){
                    slotDirectlyBeforeCurrent = existingReservation;
                }
                if(existingReservation.getCourtnumber().equals(slotToReserve.getCourtnumber()) && existingReservation.getStartTime().isEqual(slotToReserve.getEndTime())){
                    slotDirectlyAfterCurrent = existingReservation;
                }
                if(slotDirectlyBeforeCurrent != null & slotDirectlyAfterCurrent != null) break;
            }
            if(slotDirectlyBeforeCurrent == null && slotDirectlyAfterCurrent == null){
                timeSlotRepository.save(slotToReserve);
            } else if(slotDirectlyBeforeCurrent != null && slotDirectlyAfterCurrent == null){
                slotDirectlyBeforeCurrent.setEndTime(slotToReserve.getEndTime());
                timeSlotRepository.save(slotDirectlyBeforeCurrent);
            } else if(slotDirectlyBeforeCurrent == null && slotDirectlyAfterCurrent != null){
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

        Timeslot timeslot = timeSlotRepository.findById(reservationId).orElseThrow(()-> new IllegalArgumentException("Uvedená rezervácia už bola zrušená."));
        timeSlotRepository.delete(timeslot);
        return timeslot;
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/longterm-reservation/{username}")
    public List<Timeslot> makeLongtermReservation(@RequestBody String reservationParamsJson, @PathVariable String username,
                                                  HttpServletResponse response) throws JsonProcessingException {

        List<Timeslot> reservedTimeslots = new ArrayList<>();
        LongtermReservation longtermReservation = mapper.readValue(reservationParamsJson, LongtermReservation.class);
        longtermReservation.setStartDate(longtermReservation.getStartDate().truncatedTo(ChronoUnit.MINUTES));
        longtermReservation.setEndDate(longtermReservation.getEndDate().truncatedTo(ChronoUnit.MINUTES));
        longtermReservation.setUsername(username);

        longtermReservationRepository.save(longtermReservation);

        OffsetDateTime reservationStartDate= longtermReservation.getStartDate();
        OffsetDateTime reservationEndDate= longtermReservation.getEndDate();

        while (!reservationStartDate.isAfter(reservationEndDate)) {
            Timeslot timeslot = new Timeslot();
            timeslot.setUsername(username);
            timeslot.setDayOfWeek(reservationStartDate.getDayOfWeek().getValue());
            timeslot.setStartTime(reservationStartDate.withHour(longtermReservation.getStartHour()).withMinute(longtermReservation.getStartMinutes()));
            timeslot.setEndTime(reservationStartDate.withHour(longtermReservation.getEndHour()).withMinute(longtermReservation.getEndMinutes()));
            timeslot.setCourtnumber(longtermReservation.getCourtNumber());
            reservedTimeslots.add(timeslot);
            reservationStartDate = reservationStartDate.plusDays(7);
        }

        timeSlotRepository.saveAll(reservedTimeslots);

        return reservedTimeslots;
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/cancel/longterm/{reservationId}")
    public List<Timeslot> cancelLongtermReservation(@PathVariable Long reservationId,
                                                    HttpServletResponse response) {

        LongtermReservation longtermReservation = longtermReservationRepository.findById(reservationId).orElseThrow(() -> new IllegalArgumentException("Dlhodobá rezervácia s id" + reservationId + " neexistuje."));
        List<Timeslot> canceledTimeslots = getTimeslotsByLongtermReservation(longtermReservation);
        timeSlotRepository.deleteAll(canceledTimeslots);
        longtermReservationRepository.delete(longtermReservation);
        return canceledTimeslots;
    }

}
