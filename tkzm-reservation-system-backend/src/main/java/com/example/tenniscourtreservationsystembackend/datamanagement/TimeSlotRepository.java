package com.example.tenniscourtreservationsystembackend.datamanagement;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.example.tenniscourtreservationsystembackend.domain.Timeslot;
import com.example.tenniscourtreservationsystembackend.domain.Useraccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TimeSlotRepository extends JpaRepository<Timeslot, Long>{
	void deleteByStartTimeBefore(Timestamp date);

	@Query(value = "SELECT MAX(endTime) FROM Timeslot")
	Date findMaxEndTime();
	@Query(value = "SELECT MIN(endTime) FROM Timeslot")
	Date findMinEndTime();

	List<Timeslot> findByUserAccount(Useraccount userAccount);
}
