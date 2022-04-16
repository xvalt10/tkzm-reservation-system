package com.example.tenniscourtreservationsystembackend.domain;

import java.io.Serializable;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.OffsetDateTime;


/**
 * The persistent class for the TimeSlot database table.86
 * 
 */
@JsonIdentityInfo(
		generator = ObjectIdGenerators.PropertyGenerator.class,
		property = "slotId")
@Entity
@Table(name="TimeSlot")
public class Timeslot implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long slotId;

	private Integer courtnumber;

	private OffsetDateTime endTime;

	private BigDecimal price;

	private OffsetDateTime startTime;

	private String username;

	@Column(name = "day_of_week")
	private Integer dayOfWeek;

	private String description;

	public Integer getDayOfWeek() {
		return dayOfWeek;
	}

	public void setDayOfWeek(Integer dayOfWeek) {
		this.dayOfWeek = dayOfWeek;
	}

	public Timeslot() {
	}

	public Timeslot(Integer courtnumber, OffsetDateTime startTime, OffsetDateTime endTime) {
		this.courtnumber = courtnumber;
		this.endTime = endTime;
		this.startTime = startTime;
		this.dayOfWeek = startTime.getDayOfWeek().getValue();
	}

	public  Long getSlotId() {
		return this.slotId;
	}

	public void setSlotId(Long slotId) {
		this.slotId = slotId;
	}

	public Integer getCourtnumber() {
		return this.courtnumber;
	}

	public void setCourtnumber(Integer courtnumber) {
		this.courtnumber = courtnumber;
	}

	public OffsetDateTime getEndTime() {
		return this.endTime;
	}

	public void setEndTime(OffsetDateTime endTime) {
		this.endTime = endTime;
	}

	public BigDecimal getPrice() {
		return this.price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public OffsetDateTime getStartTime() {
		return this.startTime;
	}

	public void setStartTime(OffsetDateTime startTime) {
		this.startTime = startTime;
	}

	public String getUsername() {
		return this.username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
}