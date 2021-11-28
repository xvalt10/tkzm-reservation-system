package com.example.tenniscourtreservationsystembackend.domain;

import java.io.Serializable;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.math.BigDecimal;
import java.sql.Timestamp;


/**
 * The persistent class for the TimeSlot database table.86
 * 
 */
@Entity
@Table(name="TimeSlot")
@NamedQuery(name="Timeslot.findAll", query="SELECT t FROM Timeslot t")
public class Timeslot implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long slotId;

	private Integer courtnumber;

	private Timestamp endTime;

	private BigDecimal price;

	private Timestamp startTime;

	//bi-directional many-to-one association to Useraccount
	@ManyToOne
	@JoinColumn(name="userId")
	@JsonManagedReference
	private Useraccount userAccount;

	public Timeslot() {
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

	public Timestamp getEndTime() {
		return this.endTime;
	}

	public void setEndTime(Timestamp endTime) {
		this.endTime = endTime;
	}

	public BigDecimal getPrice() {
		return this.price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public Timestamp getStartTime() {
		return this.startTime;
	}

	public void setStartTime(Timestamp startTime) {
		this.startTime = startTime;
	}

	public Useraccount getUserAccount() {
		return this.userAccount;
	}

	public void setUserAccount(Useraccount userAccount) {
		this.userAccount = userAccount;
	}

}