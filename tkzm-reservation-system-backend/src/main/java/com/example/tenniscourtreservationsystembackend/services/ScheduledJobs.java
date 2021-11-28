package com.example.tenniscourtreservationsystembackend.services;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.temporal.ChronoUnit;
import java.util.Calendar;
import java.util.Date;


import com.example.tenniscourtreservationsystembackend.datamanagement.TimeSlotRepository;
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
	
	@Autowired
	TimeSlotRepository timeslotRepository;


	
	@Scheduled(cron="0 0/1 * * * *")
	public void deleteOldTimeSlots(){

		addNewTimeSlotsIfNecessary();

		Calendar currentDate = Calendar.getInstance();
		currentDate.setTime(new Date());
		currentDate.add(Calendar.HOUR,-1);
		System.out.println("Deleting all timeslots which start before:" +currentDate.getTime());
		timeslotRepository.deleteByStartTimeBefore(new Timestamp(currentDate.getTimeInMillis()));
		
		
	}

	//@Scheduled(cron="0 26 9 * * *")
	public void addNewTimeSlotsIfNecessary(){


		Date oldestStoredDate = timeslotRepository.findMinEndTime();
		Date newestStoredDate = timeslotRepository.findMaxEndTime();

		int daysBetween = 0;
		Calendar currentDate = Calendar.getInstance();
		Calendar timeslotStartDate = Calendar.getInstance();
		Calendar timeslotEndDate = Calendar.getInstance();
		if(newestStoredDate == null){
			currentDate.setTime(new Date());
		}else{
			daysBetween = Math.round(ChronoUnit.DAYS.between(oldestStoredDate.toInstant(), newestStoredDate.toInstant()));
			System.out.println("-------------------");
			System.out.println("Oldest stored date:"+oldestStoredDate);
			System.out.println("Newest stored date:"+newestStoredDate);
			System.out.println("Days between:"+daysBetween);

			currentDate.setTime(newestStoredDate);
			currentDate.add(Calendar.DATE, 1);
		}

		for (int i = 0; i < 10-daysBetween; i++) {
			System.out.println("Adding slots for "+currentDate.getTime());
			int day=currentDate.get(Calendar.DAY_OF_MONTH);
			int month=currentDate.get(Calendar.MONTH);
			int year = currentDate.get(Calendar.YEAR);

			timeslotStartDate.set(Calendar.DAY_OF_MONTH, day);
			timeslotStartDate.set(Calendar.MONTH, month);
			timeslotStartDate.set(Calendar.YEAR, year);

			timeslotEndDate.set(Calendar.DAY_OF_MONTH, day);
			timeslotEndDate.set(Calendar.MONTH, month);
			timeslotEndDate.set(Calendar.YEAR, year);

			for(int hour =5; hour<=20; hour++){
				for (int court = 1;court<=4;court++){
					Timeslot slot = new Timeslot();
					timeslotStartDate.set(Calendar.HOUR_OF_DAY, hour);
					timeslotStartDate.set(Calendar.MINUTE, 0);

					timeslotEndDate.set(Calendar.HOUR_OF_DAY, hour);
					timeslotEndDate.set(Calendar.MINUTE, 30);

					slot.setCourtnumber(court);
					slot.setStartTime(new Timestamp(timeslotStartDate.getTimeInMillis()));
					slot.setEndTime(new Timestamp(timeslotEndDate.getTimeInMillis()));
					slot.setPrice(hour <=15?new BigDecimal(12):new BigDecimal(17));

					timeslotRepository.save(slot);

					Timeslot slot2 = new Timeslot();
					timeslotStartDate.set(Calendar.HOUR_OF_DAY, hour);
					timeslotStartDate.set(Calendar.MINUTE, 30);

					timeslotEndDate.set(Calendar.HOUR_OF_DAY, hour+1);
					timeslotEndDate.set(Calendar.MINUTE, 0);

					slot2.setCourtnumber(court);
					slot2.setStartTime(new Timestamp(timeslotStartDate.getTimeInMillis()));
					slot2.setEndTime(new Timestamp(timeslotEndDate.getTimeInMillis()));
					slot2.setPrice(hour <=15?new BigDecimal(12):new BigDecimal(17));

					timeslotRepository.save(slot2);
				}
			}
			currentDate.add(Calendar.DATE, 1);
		}
		

	
		
	}
}
