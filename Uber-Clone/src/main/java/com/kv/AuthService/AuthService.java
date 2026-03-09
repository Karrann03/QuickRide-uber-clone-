package com.kv.AuthService;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kv.dto.LoginRequestDto;
import com.kv.dto.LoginResponseDto;
import com.kv.entity.DriverEntity;
import com.kv.entity.UserEntity;
import com.kv.repository.DriverRepository;
import com.kv.repository.UserRepository;

@Service
public class AuthService implements IAuthService {
	
	@Autowired
	private UserRepository userRepo;


	@Autowired
	private DriverRepository driverRepo;

	@Override
	public LoginResponseDto login(LoginRequestDto request) {

		 Optional<UserEntity> userOpt = userRepo.findByEmail(request.getEmail());

	        if (userOpt.isPresent()) {
	            UserEntity user = userOpt.get();

	            if (!user.getPassword().equals(request.getPassword())) {
	                throw new RuntimeException("Invalid Password");
	            }

	            return new LoginResponseDto(
	                    user.getId(),
	                    "USER",
	                    "Login Successful"
	            );
	        }

	        Optional<DriverEntity> driverOpt = driverRepo.findByEmail(request.getEmail());

	        if (driverOpt.isPresent()) {
	            DriverEntity driver = driverOpt.get();

	            if (!driver.getPassword().equals(request.getPassword())) {
	                throw new RuntimeException("Invalid Password");
	            }

	            return new LoginResponseDto(
	                    driver.getId(),
	                    "DRIVER",
	                    "Login Successful"
	            );
	        }

	        throw new RuntimeException("Account not found");
	}
}
