package com.example.tenniscourtreservationsystembackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "reservation-system")
public class ReservationSystemConfiguration {
    private int minHour;
    private int maxHour;
    private int courtCount;
    private int timeSpanInDays;

    public int getTimeSpanInDays() {
        return timeSpanInDays;
    }

    public void setTimeSpanInDays(int timeSpanInDays) {
        this.timeSpanInDays = timeSpanInDays;
    }

    public int getMinHour() {
        return minHour;
    }

    public void setMinHour(int minHour) {
        this.minHour = minHour;
    }

    public int getMaxHour() {
        return maxHour;
    }

    public void setMaxHour(int maxHour) {
        this.maxHour = maxHour;
    }

    public int getCourtCount() {
        return courtCount;
    }

    public void setCourtCount(int courtCount) {
        this.courtCount = courtCount;
    }
}
