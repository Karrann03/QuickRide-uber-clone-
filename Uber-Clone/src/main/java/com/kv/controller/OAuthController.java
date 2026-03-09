package com.kv.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kv.dto.LoginRequestDto;
import com.kv.dto.LoginResponseDto;
import com.kv.entity.DriverEntity;
import com.kv.entity.UserEntity;
import com.kv.repository.DriverRepository;
import com.kv.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // allow frontend calls
public class OAuthController {

	 @Autowired
	    private UserRepository userRepo;

	    @Autowired
	    private DriverRepository driverRepo;

	    @PostMapping("/login")
	    public LoginResponseDto login(@RequestBody LoginRequestDto request) {
	        // 1️⃣ Check User table
	        Optional<UserEntity> userOpt = userRepo.findByEmail(request.getEmail());
	        if(userOpt.isPresent()) {
	            UserEntity user = userOpt.get();
	            if(!user.getPassword().equals(request.getPassword())) {
	                throw new RuntimeException("Invalid password");
	            }
	            return new LoginResponseDto(user.getId(), "USER", "Login Successful");
	        }

	        // 2️⃣ Check Driver table
	        Optional<DriverEntity> driverOpt = driverRepo.findByEmail(request.getEmail());
	        if(driverOpt.isPresent()) {
	            DriverEntity driver = driverOpt.get();
	            if(!driver.getPassword().equals(request.getPassword())) {
	                throw new RuntimeException("Invalid password");
	            }
	            return new LoginResponseDto(driver.getId(), "DRIVER", "Login Successful");
	        }

	        throw new RuntimeException("Account not found");
	    }
	   
}
