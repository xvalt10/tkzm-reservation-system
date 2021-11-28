package com.example.tenniscourtreservationsystembackend.services;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import com.example.tenniscourtreservationsystembackend.datamanagement.TimeSlotRepository;
import com.example.tenniscourtreservationsystembackend.datamanagement.UserAccountRepository;
import com.example.tenniscourtreservationsystembackend.domain.Timeslot;
import com.example.tenniscourtreservationsystembackend.domain.Useraccount;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;


@RestController
@CrossOrigin(origins = "https://localhost:3000")
@RequestMapping("/timeslots")
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final UserAccountRepository userAccountRepository;

    @Autowired
    TimeSlotService(TimeSlotRepository timeSlotRepository, UserAccountRepository userAccountRepository) {
        this.timeSlotRepository = timeSlotRepository;
        this.userAccountRepository = userAccountRepository;

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
        Map<Integer, List<Timeslot>> slots = this.timeSlotRepository.findByUserAccount(userAccount).stream().collect(Collectors.groupingBy(Timeslot::getCourtnumber));
        return slots;

    }

    @RequestMapping(method = RequestMethod.PUT, value = "/reserve/{userId}")
    public List<Timeslot> reserveTimeSlots(@RequestBody String slotIdsAsJsonArray, @PathVariable Long userId,
                                      HttpServletResponse response) throws JsonProcessingException {

        ObjectMapper mapper = new ObjectMapper();
        List<Timeslot> reservedTimeslots= new ArrayList<>();
        Long[] slotIdsToReserve = mapper.readValue(slotIdsAsJsonArray, Long[].class);
        Arrays.asList(slotIdsToReserve).forEach((slotId) -> {
            Timeslot timeslot = timeSlotRepository.findById(slotId).orElseThrow(IllegalArgumentException::new);
            Useraccount userAccount = userAccountRepository.findById(userId).orElseThrow(IllegalArgumentException::new);

//        userAccount.setAccountbalance(userAccount.getAccountbalance().subtract(timeslot.getPrice()));
//        if (userAccount.getAccountbalance().compareTo(new BigDecimal(0)) < 0) {
//            throw new InsufficientFundsException();
//        }
            userAccountRepository.save(userAccount);
            timeslot.setUserAccount(userAccount);
            timeslot = timeSlotRepository.save(timeslot);
            reservedTimeslots.add(timeslot);
        });
        return reservedTimeslots;
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/cancel")
    public List<Timeslot> cancelReservation(@RequestBody String slotIdsAsJsonArray,
                                           HttpServletResponse response) throws JsonProcessingException {

        ObjectMapper mapper = new ObjectMapper();
        List<Timeslot> canceledTimeslots= new ArrayList<>();
        Long[] slotIdsToCancel= mapper.readValue(slotIdsAsJsonArray, Long[].class);
        Arrays.asList(slotIdsToCancel).forEach((slotId) -> {
            Timeslot timeslot = timeSlotRepository.findById(slotId).orElseThrow(IllegalArgumentException::new);
            timeslot.setUserAccount(null);
            timeslot = timeSlotRepository.save(timeslot);
            canceledTimeslots.add(timeslot);
        });
        return canceledTimeslots;
    }

    @RequestMapping(method = RequestMethod.GET, value = "uniqueDates")
    private List<String> getUniqueDates() {
        List<String> uniqueDates = new ArrayList<String>();
        Calendar calendar = Calendar.getInstance();
        String dateString;
        List<Timeslot> timeslots = timeSlotRepository.findAll();
        for (Iterator<Timeslot> iterator = timeslots.iterator(); iterator.hasNext(); ) {

            calendar.setTimeInMillis(iterator.next().getStartTime().getTime());

            int mMonth = calendar.get(Calendar.MONTH) + 1;
            int mDay = calendar.get(Calendar.DAY_OF_MONTH);
            dateString = String.valueOf(mDay).concat(".").concat(String.valueOf(mMonth));
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
