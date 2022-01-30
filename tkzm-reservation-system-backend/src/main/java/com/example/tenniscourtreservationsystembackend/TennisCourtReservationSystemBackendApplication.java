package com.example.tenniscourtreservationsystembackend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Map;

@SpringBootApplication
@EnableScheduling
public class TennisCourtReservationSystemBackendApplication {

    public static void main(String[] args) {
//        Map<String, String> envVariables = System.getenv();
//        envVariables.entrySet().forEach(envVariableEntry -> {
//            if (envVariableEntry.getKey().contains("DATASOURCE"))
//                System.out.println(String.format("Env property %s=%s", envVariableEntry.getKey(), envVariableEntry.getValue()));
//        });
        SpringApplication.run(TennisCourtReservationSystemBackendApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedMethods("GET", "PUT", "POST")
                        .allowedOrigins("https://localhost:3000", "https://tkzm-rezervacie.azurewebsites.net", "https://tkzm-rezervacie.wittyisland-57a63db4.northeurope.azurecontainerapps.io", "https://tkzm-rezervacie.herokuapp.com");
            }
        };
    }

}

