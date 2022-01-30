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

	@Query(value = "SELECT MAX(endTime) FROM Timeslot")
	OffsetDateTime findMaxEndTime();

	@Query(value = "SELECT MIN(endTime) FROM Timeslot")
	OffsetDateTime findMinEndTime();

	List<Timeslot> findByDayOfWeekAndCourtnumber(Integer dayOfWeek, Integer courtNumber);

	List<Timeslot> findByUsername(String username);

}
