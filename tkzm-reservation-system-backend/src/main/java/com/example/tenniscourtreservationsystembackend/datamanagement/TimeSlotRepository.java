package com.example.tenniscourtreservationsystembackend.datamanagement;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.List;

import com.example.tenniscourtreservationsystembackend.domain.Timeslot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TimeSlotRepository extends JpaRepository<Timeslot, Long>{

	void deleteByStartTimeBefore(OffsetDateTime date);

	List<Timeslot> findByStartTimeAfter(OffsetDateTime currentDate);

	List<Timeslot> findByDayOfWeekAndCourtnumber(Integer dayOfWeek, Integer courtNumber);

	List<Timeslot> findByUsernameAndStartTimeAfterOrderBySlotId(String username, OffsetDateTime currentDate);

	List<Timeslot> findByCourtnumberAndStartTimeBetween(Integer courtNumber, OffsetDateTime reservationStartTime, OffsetDateTime reservationEndTime);

	List<Timeslot> findByUsername(String username);

}
