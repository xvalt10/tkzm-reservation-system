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

	@Scheduled(cron="0 0/1 * * * *")
	public void deleteOldTimeSlots(){

		addNewTimeSlotsIfNecessary();

		OffsetDateTime currentTime = OffsetDateTime.now().withOffsetSameInstant(ZoneOffset.UTC);

		System.out.println("Deleting all timeslots which start before:" +currentTime);
		timeslotRepository.deleteByStartTimeBefore(currentTime);
		
		
	}

	//@Scheduled(cron="0 26 9 * * *")
	public void addNewTimeSlotsIfNecessary(){

		OffsetDateTime oldestStoredDate = timeslotRepository.findMinEndTime();
		OffsetDateTime newestStoredDate = timeslotRepository.findMaxEndTime();

		int daysBetween = 0;
		OffsetDateTime slotGenerationStartDate;

		if(newestStoredDate != null){
			daysBetween = Math.round(ChronoUnit.DAYS.between(oldestStoredDate.toInstant(), newestStoredDate.toInstant()));
			System.out.println("-------------------");
			System.out.println("Oldest stored date:"+oldestStoredDate);
			System.out.println("Newest stored date:"+newestStoredDate);
			System.out.println("Days between:"+daysBetween);

			slotGenerationStartDate=newestStoredDate.plusDays(1);
		}else{
			slotGenerationStartDate = OffsetDateTime.now();
		}

		System.out.println(slotGenerationStartDate);

		for (int i = 0; i < reservationSystemConfiguration.getTimeSpanInDays()-daysBetween; i++) {
			System.out.println("Adding slots for "+slotGenerationStartDate);

			for(int hour = reservationSystemConfiguration.getMinHour(); hour<reservationSystemConfiguration.getMaxHour(); hour++){


				for (int court = 1;court<=reservationSystemConfiguration.getCourtCount();court++){


					OffsetDateTime timeslotStartDate = slotGenerationStartDate.withHour(hour).withMinute(0);
					OffsetDateTime timeslotEndDate = slotGenerationStartDate.withHour(hour).withMinute(30);
					Timeslot slot = new Timeslot(court, timeslotStartDate, timeslotEndDate);
					reserveTimeslotIfLongTermReservationExists(slot);

					timeslotRepository.save(slot);

					timeslotStartDate = slotGenerationStartDate.withHour(hour).withMinute(30);
					timeslotEndDate = slotGenerationStartDate.withHour(hour+1).withMinute(0);


					Timeslot slot2 = new Timeslot(court, timeslotStartDate, timeslotEndDate);
					reserveTimeslotIfLongTermReservationExists(slot2);

					timeslotRepository.save(slot2);
				}
			}
			slotGenerationStartDate=slotGenerationStartDate.plusDays(1);
		}
		

	
		
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
