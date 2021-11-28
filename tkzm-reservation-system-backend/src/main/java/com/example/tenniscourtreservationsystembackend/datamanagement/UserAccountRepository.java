package com.example.tenniscourtreservationsystembackend.datamanagement;



import com.example.tenniscourtreservationsystembackend.domain.Useraccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<Useraccount, Long> {
	
	Useraccount findByUsername(String username);

}