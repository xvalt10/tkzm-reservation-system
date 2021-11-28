package com.example.tenniscourtreservationsystembackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TennisCourtReservationSystemBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TennisCourtReservationSystemBackendApplication.class, args);
    }

}
