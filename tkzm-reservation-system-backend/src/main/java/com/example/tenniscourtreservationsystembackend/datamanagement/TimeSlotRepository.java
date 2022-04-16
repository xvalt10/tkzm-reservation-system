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

	List<Timeslot> findByStartTimeBetween(OffsetDateTime startDateTime, OffsetDateTime endDateTime);

	List<Timeslot> findByDayOfWeekAndCourtnumber(Integer dayOfWeek, Integer courtNumber);

	List<Timeslot> findByCourtnumberAndStartTimeBetween(Integer courtNumber, OffsetDateTime reservationStartTime, OffsetDateTime reservationEndTime);

	List<Timeslot> findByUsername(String username);

	List<Timeslot> findByUsernameAndStartTimeBetweenOrderBySlotId(String username, OffsetDateTime startDateTime, OffsetDateTime endDateTime);

	List<Timeslot> findByUsernameAndStartTimeBetween(String username, OffsetDateTime startDateTime, OffsetDateTime endDateTime);

	List<Timeslot> findByUsernameAndStartTimeBetweenOrderByStartTime(String username, OffsetDateTime startDateTime, OffsetDateTime endDateTime);

}
