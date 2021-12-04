package com.example.tenniscourtreservationsystembackend.services;

import com.example.tenniscourtreservationsystembackend.datamanagement.UserAccountRepository;
import com.example.tenniscourtreservationsystembackend.domain.UserRole;
import com.example.tenniscourtreservationsystembackend.domain.Useraccount;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserService {

    private final UserAccountRepository userAccountRepository;

    UserService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @RequestMapping(method = RequestMethod.GET)
    private List<Useraccount> getAllUserAccounts() {

        return userAccountRepository.findAll();

    }

    @RequestMapping(method = RequestMethod.POST, value="/save")
    private Useraccount registerUser(@RequestParam(value = "username") String username,
                              @RequestParam(value = "password") String password) {

        Useraccount userAccount = userAccountRepository.findByUsername(username);
        if (userAccount != null) {
            return userAccount;
        } else {
            userAccount = new Useraccount();
            userAccount.setUsername(username);
            if(password != null) {
                userAccount.setPassword(password);
            }
            userAccount.setEnabled(true);

            UserRole role = new UserRole();
            role.setUserAccount(userAccount);
            role.setRole("ROLE_USER");
            userAccount.setUserRole(role);
            return userAccountRepository.save(userAccount);
        }
    }



}


