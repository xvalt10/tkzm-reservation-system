package com.example.tenniscourtreservationsystembackend.domain;

import java.io.Serializable;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.*;

import java.math.BigDecimal;
import java.util.List;


/**
 * The persistent class for the UserAccount database table.
 * 
 */
@Entity
@Table(name="UserAccount")
@NamedQuery(name="Useraccount.findAll", query="SELECT u FROM Useraccount u")
public class Useraccount implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long userId;

	@JsonIgnore
	private BigDecimal accountbalance;

	private boolean enabled;

	@JsonIgnore
	private String password;

	private String username;

	@JsonIgnore
	private int eloblitz;

	@JsonIgnore
	private int elorapid;

	@JsonIgnore
	private int elobullet;
	@JsonIgnore
	private int eloclassical;

	public int getEloblitz() {
		return eloblitz;
	}
	public void setEloblitz(int elo) {
		this.eloblitz = elo;
	}

	public int getElorapid() {
		return elorapid;
	}

	public void setElorapid(int elorapid) {
		this.elorapid = elorapid;
	}

	public int getElobullet() {
		return elobullet;
	}

	public void setElobullet(int elobullet) {
		this.elobullet = elobullet;
	}

	public int getEloclassical() {
		return eloclassical;
	}

	public void setEloclassical(int eloclassical) {
		this.eloclassical = eloclassical;
	}


	//@OneToMany(mappedBy="userAccount")
	//@JsonManagedReference(value = "user-timeslot")
	//private List<Timeslot> timeSlots;

	//@OneToMany(mappedBy="userAccount")
	//@JsonManagedReference(value = "user-longtermreservation")
	//private List<LongtermReservation> longtermReservations;

	//bi-directional one-to-one association to UserRole
	@OneToOne(mappedBy="userAccount")
	//@JsonManagedReference(value="useraccount-role")
	private UserRole userRole;

	public Useraccount() {
	}

	public Long getUserId() {
		return this.userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public BigDecimal getAccountbalance() {
		return this.accountbalance;
	}

	public void setAccountbalance(BigDecimal accountbalance) {
		this.accountbalance = accountbalance;
	}

	public boolean getEnabled() {
		return this.enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public String getPassword() {
		return this.password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getUsername() {
		return this.username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

//	public List<Timeslot> getTimeSlots() {
//		return this.timeSlots;
//	}
//
//	public void setTimeSlots(List<Timeslot> timeSlots) {
//		this.timeSlots = timeSlots;
//	}
//
//	public Timeslot addTimeSlot(Timeslot timeSlot) {
//		getTimeSlots().add(timeSlot);
//		timeSlot.setUserAccount(this);
//
//		return timeSlot;
//	}
//
//	public Timeslot removeTimeSlot(Timeslot timeSlot) {
//		getTimeSlots().remove(timeSlot);
//		timeSlot.setUserAccount(null);
//
//		return timeSlot;
//	}

	public UserRole getUserRole() {
		return this.userRole;
	}

	public void setUserRole(UserRole userRole) {
		this.userRole = userRole;
	}

}