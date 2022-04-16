package com.example.tenniscourtreservationsystembackend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
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
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> containerCustomizer() {
        return container -> {
            container.addErrorPages(new ErrorPage(HttpStatus.NOT_FOUND,
                    "/notFound"));
        };
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addViewControllers(ViewControllerRegistry registry) {
                registry.addViewController("/notFound").setViewName("forward:/index.html");
            }

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedMethods("GET", "PUT", "POST")
                        .allowedOrigins("https://localhost:3000", "https://tkzm-rezervacie.azurewebsites.net", "https://tkzm-rezervacie.wittyisland-57a63db4.northeurope.azurecontainerapps.io", "https://tkzm-rezervacie.herokuapp.com");
            }
        };
    }

}

