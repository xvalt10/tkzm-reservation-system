package com.example.tenniscourtreservationsystembackend.datamanagement;

import com.example.tenniscourtreservationsystembackend.domain.LongtermReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface LongtermReservationRepository extends JpaRepository<LongtermReservation, Long> {

    List<LongtermReservation> findByUsername(String username);
    void deleteByEndDateBefore(OffsetDateTime currentDate);
}