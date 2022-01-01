package com.example.tenniscourtreservationsystembackend.services;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import com.example.tenniscourtreservationsystembackend.datamanagement.LongtermReservationRepository;
import com.example.tenniscourtreservationsystembackend.datamanagement.TimeSlotRepository;
import com.example.tenniscourtreservationsystembackend.datamanagement.UserAccountRepository;
import com.example.tenniscourtreservationsystembackend.domain.LongtermReservation;
import com.example.tenniscourtreservationsystembackend.domain.Timeslot;
import com.example.tenniscourtreservationsystembackend.domain.Useraccount;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/timeslots")
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final UserAccountRepository userAccountRepository;
    private final LongtermReservationRepository longtermReservationRepository;

    @Autowired
    TimeSlotService(TimeSlotRepository timeSlotRepository, UserAccountRepository userAccountRepository, LongtermReservationRepository longtermReservationRepository) {
        this.timeSlotRepository = timeSlotRepository;
        this.userAccountRepository = userAccountRepository;
        this.longtermReservationRepository = longtermReservationRepository;

    }

    @RequestMapping(method = RequestMethod.GET)
    private List<Timeslot> getTimeSlots() {
        return this.timeSlotRepository.findAll();

    }

    @RequestMapping(method = RequestMethod.GET, value = "/byCourt")
    private Map<Integer, List<Timeslot>> getTimeSlotsByCourts() {
        return this.timeSlotRepository.findAll().stream().collect(Collectors.groupingBy(Timeslot::getCourtnumber));

    }

    @RequestMapping(method = RequestMethod.GET, value = "/user/{userId}")
    private Map<Integer, List<Timeslot>> getTimeSlotsReservedByUser(@PathVariable Long userId) {
        Useraccount userAccount = userAccountRepository.findById(userId).orElseThrow(IllegalArgumentException::new);
        return this.timeSlotRepository.findByUserAccount(userAccount).stream().collect(Collectors.groupingBy(Timeslot::getCourtnumber));

    }

    @RequestMapping(method = RequestMethod.GET, value = "/longterm/user/{userId}")
    private List<LongtermReservation> getLongtermReservationsByUser(@PathVariable Long userId) {
        Useraccount userAccount = userAccountRepository.findById(userId).orElseThrow(IllegalArgumentException::new);
        return this.longtermReservationRepository.findByUserAccount(userAccount).stream().collect(Collectors.toList());
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/longterm-reservation/{userId}")
    public List<Timeslot> makeLongtermReservation(@RequestBody String reservationParamsJson, @PathVariable Long userId,
                                                  HttpServletResponse response) throws JsonProcessingException {

        Useraccount userAccount = userAccountRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Rezervácia nebola úspešná lebo ID vášho používatele nie je zaevidované v systéme."));

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        List<Timeslot> reservedTimeslots = new ArrayList<>();
        LongtermReservation longtermReservation = mapper.readValue(reservationParamsJson, LongtermReservation.class);
        longtermReservation.setUserAccount(userAccount);

        longtermReservationRepository.save(longtermReservation);

        List<Timeslot> slotsMatchedWithLongtermReservationParams = getTimeslotsByLongtermReservation(longtermReservation);
        slotsMatchedWithLongtermReservationParams.forEach(timeslot -> {
            if (timeslot.getUserAccount() == null) {
                timeslot.setUserAccount(userAccount);
                timeslot = timeSlotRepository.save(timeslot);
                reservedTimeslots.add(timeslot);
            }
        });

        return reservedTimeslots;
    }

    public List<Timeslot> getTimeslotsByLongtermReservation(LongtermReservation longtermReservation) {
        List<Timeslot> slotsForSpecificDayOfWeekAndCourt = timeSlotRepository.findByDayOfWeekAndCourtnumber(longtermReservation.getDayOfWeek(), longtermReservation.getCourtNumber());
        return slotsForSpecificDayOfWeekAndCourt.stream().filter(timeslot -> timeslotDateTimeCoveredByLongtermReservation(longtermReservation, timeslot)
        ).collect(Collectors.toList());

    }

    public boolean timeslotDateTimeCoveredByLongtermReservation(LongtermReservation longtermReservation, Timeslot timeslot) {
        return
        (timeslot.getStartTime().isAfter(longtermReservation.getStartDate().withHour(0))
                && timeslot.getEndTime().isBefore(longtermReservation.getEndDate().withHour(23))) &&
                (timeslot.getStartTime().getHour() > longtermReservation.getStartHour() ||
                        (timeslot.getStartTime().getHour() == longtermReservation.getStartHour() &&
                                timeslot.getStartTime().getMinute() >= longtermReservation.getStartMinutes()))
                        && (timeslot.getEndTime().getHour() < longtermReservation.getEndHour() ||
                        (timeslot.getEndTime().getHour() == longtermReservation.getEndHour() &&
                                timeslot.getEndTime().getMinute() <= longtermReservation.getEndMinutes()));
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/reserve/{userId}")
    public List<Timeslot> makeOneTimeReservation(@RequestBody String slotIdsAsJsonArray, @PathVariable Long userId,
                                                 HttpServletResponse response) throws JsonProcessingException {

        Useraccount userAccount = userAccountRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Rezervácia nebola úspešná lebo ID vášho používatele nie je zaevidované v systéme."));

        ObjectMapper mapper = new ObjectMapper();
        List<Timeslot> reservedTimeslots = new ArrayList<>();
        Long[] slotIdsToReserve = mapper.readValue(slotIdsAsJsonArray, Long[].class);
        List<Timeslot> vacantTimeslots = new ArrayList<>();
        Arrays.asList(slotIdsToReserve).forEach((slotId) -> {
            Timeslot timeslot = timeSlotRepository.findById(slotId).orElseThrow(IllegalArgumentException::new);
            if (timeslot.getUserAccount() == null) {
                vacantTimeslots.add(timeslot);
            } else
                throw new IllegalArgumentException("Rezervácia nebola úspešná lebo jedno z časových okien je už rezervované iným používateľom. Vyberte prosím iný čas rezervácie.");
//        userAccount.setAccountbalance(userAccount.getAccountbalance().subtract(timeslot.getPrice()));
//        if (userAccount.getAccountbalance().compareTo(new BigDecimal(0)) < 0) {
//            throw new InsufficientFundsException();
//        }

        });

        vacantTimeslots.forEach((timeslot) -> {
            userAccountRepository.save(userAccount);
            timeslot.setUserAccount(userAccount);
            timeslot = timeSlotRepository.save(timeslot);
            reservedTimeslots.add(timeslot);
        });
        return reservedTimeslots;
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/cancel")
    public List<Timeslot> cancelOneTimeReservation(@RequestBody String slotIdsAsJsonArray,
                                                   HttpServletResponse response) throws JsonProcessingException {

        ObjectMapper mapper = new ObjectMapper();
        List<Timeslot> canceledTimeslots = new ArrayList<>();
        Long[] slotIdsToCancel = mapper.readValue(slotIdsAsJsonArray, Long[].class);
        Arrays.asList(slotIdsToCancel).forEach((slotId) -> {
            Timeslot timeslot = timeSlotRepository.findById(slotId).orElseThrow(IllegalArgumentException::new);
            timeslot.setUserAccount(null);
            timeslot = timeSlotRepository.save(timeslot);
            canceledTimeslots.add(timeslot);
        });
        return canceledTimeslots;
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/cancel/{reservationId}")
    public List<Timeslot> cancelLongtermReservation(@PathVariable Long reservationId,
                                                    HttpServletResponse response) throws JsonProcessingException {

        LongtermReservation longtermReservation = longtermReservationRepository.findById(reservationId).orElseThrow(() -> new IllegalArgumentException("Dlhodobá rezervácia s id" + reservationId + " neexistuje."));
        List<Timeslot> canceledTimeslots = new ArrayList<>();
        List<Timeslot> slotsMatchedWithLongtermReservationParams = getTimeslotsByLongtermReservation(longtermReservation);
        slotsMatchedWithLongtermReservationParams.forEach(timeslot -> {
                    timeslot.setUserAccount(null);
                    timeslot = timeSlotRepository.save(timeslot);
                    canceledTimeslots.add(timeslot);
                }
        );

        longtermReservationRepository.delete(longtermReservation);
        return canceledTimeslots;
    }


    @RequestMapping(method = RequestMethod.GET, value = "uniqueDates")
    private List<String> getUniqueDates() {
        List<String> uniqueDates = new ArrayList<>();
        Calendar calendar = Calendar.getInstance();
        String dateString;
        List<Timeslot> timeslots = timeSlotRepository.findAll();
        for (Timeslot timeslot : timeslots) {
            OffsetDateTime timestamp = timeslot.getStartTime();
            DayOfWeek dayOfWeek = timestamp.getDayOfWeek();

            int mMonth = timestamp.getMonthValue();
            int mDay = timestamp.getDayOfMonth();
            String dayOfWeekString = dayOfWeek.getDisplayName(TextStyle.FULL, new Locale("sk", "SK"));
            dateString = String.valueOf(mDay).concat(".").concat(String.valueOf(mMonth).concat(" (" + dayOfWeekString + ")"));
            if (!uniqueDates.contains(dateString)) {
                uniqueDates.add(dateString);
            }

        }
        return uniqueDates;

    }

    @ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
    class InsufficientFundsException extends RuntimeException {
        private static final long serialVersionUID = 1L;

        public InsufficientFundsException() {
            super("The sum to be paid exceeds your account balance.");
        }
    }

}
