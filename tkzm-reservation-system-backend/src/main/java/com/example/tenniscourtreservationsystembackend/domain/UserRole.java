package com.example.tenniscourtreservationsystembackend.domain;

import java.io.Serializable;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;


/**
 * The persistent class for the UserRole database table.
 * 
 */
@Entity
@NamedQuery(name="UserRole.findAll", query="SELECT u FROM UserRole u")
public class UserRole implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int userroleId;

	
	private String role;

	//bi-directional one-to-one association to Useraccount
	@OneToOne
	@JoinColumn(name="userId")	
	@JsonBackReference
	private Useraccount userAccount;

	public UserRole() {
	}

	public int getUserroleId() {
		return this.userroleId;
	}

	public void setUserroleId(int userroleId) {
		this.userroleId = userroleId;
	}

	public Object getRole() {
		return this.role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public Useraccount getUserAccount() {
		return this.userAccount;
	}
	public void setUserAccount(Useraccount userAccount) {
		this.userAccount = userAccount;
	}

}