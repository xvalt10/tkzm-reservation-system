package com.example.tenniscourtreservationsystembackend.services;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.Calendar;
import java.util.Date;
import java.util.List;


import com.example.tenniscourtreservationsystembackend.config.ReservationSystemConfiguration;
import com.example.tenniscourtreservationsystembackend.datamanagement.LongtermReservationRepository;
import com.example.tenniscourtreservationsystembackend.datamanagement.TimeSlotRepository;
import com.example.tenniscourtreservationsystembackend.domain.LongtermReservation;
import com.example.tenniscourtreservationsystembackend.domain.Timeslot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional
@Configuration
public class ScheduledJobs {

	TimeSlotRepository timeslotRepository;
	ReservationSystemConfiguration reservationSystemConfiguration;
	LongtermReservationRepository longtermReservationRepository;
	TimeSlotService timeSlotService;

	public ScheduledJobs(TimeSlotRepository timeslotRepository, ReservationSystemConfiguration reservationSystemConfiguration,
						 LongtermReservationRepository longtermReservationRepository, TimeSlotService timeSlotService) {
		this.timeslotRepository = timeslotRepository;
		this.reservationSystemConfiguration = reservationSystemConfiguration;
		this.longtermReservationRepository = longtermReservationRepository;
		this.timeSlotService = timeSlotService;
	}

	@Scheduled(cron="0 0 * * * *")
	public void deleteReservationsOlderThanOneMonth(){

		OffsetDateTime oneMonthAgo = OffsetDateTime.now().minusMonths(1);

		System.out.println("Deleting short term and long term reservations older than " + oneMonthAgo);
		timeslotRepository.deleteByStartTimeBefore(oneMonthAgo);
		longtermReservationRepository.deleteByEndDateBefore(oneMonthAgo);

	}

	private void reserveTimeslotIfLongTermReservationExists(Timeslot timeslot) {
		List<LongtermReservation> longtermReservations = longtermReservationRepository.findAll();
		for (LongtermReservation longtermReservation : longtermReservations) {
			if (timeslot.getCourtnumber().equals(longtermReservation.getCourtNumber()) &&
					timeslot.getDayOfWeek().equals(longtermReservation.getDayOfWeek()) &&
					timeSlotService.timeslotDateTimeCoveredByLongtermReservation(longtermReservation, timeslot)) {
				    timeslot.setUsername(longtermReservation.getUsername());
			}
		}
	}
}
