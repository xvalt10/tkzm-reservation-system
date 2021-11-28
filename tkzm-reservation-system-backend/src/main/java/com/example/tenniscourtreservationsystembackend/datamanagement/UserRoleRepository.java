package com.example.tenniscourtreservationsystembackend.datamanagement;

import com.example.tenniscourtreservationsystembackend.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

}
