package com.example.tenniscourtreservationsystembackend.datamanagement;

import com.example.tenniscourtreservationsystembackend.domain.LongtermReservation;
import com.example.tenniscourtreservationsystembackend.domain.Useraccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LongtermReservationRepository extends JpaRepository<LongtermReservation, Long> {

    List<LongtermReservation> findByUserAccount(Useraccount useraccount);
}