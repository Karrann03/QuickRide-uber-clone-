package com.kv.service.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kv.dto.UserResponseDto;
import com.kv.entity.UserEntity;
import com.kv.repository.UserRepository;

@Service
public class UserServcieImpl implements IUserService {

	@Autowired
	private UserRepository userRepo;
	

	@Override
	public String registerUser(UserEntity user) {
		 UserEntity user1 = userRepo.save(user);
		return user1.getId() + " Registered Successfully"; 
	}


	@Override
	public String loginUser(String email, String password) {
			UserEntity resp = userRepo.findByEmail(email)
			.filter(user -> user.getPassword().equals(password))
			.orElseThrow(()-> new RuntimeException("Invalid Credentials"));
		return "Login SuccessFully";
	}


	@Override
	public List<UserResponseDto> getAllUsers() {
		List<UserEntity> user = userRepo.findAll();
		return user.stream().map(this::convertToDto).toList();
	}
	
	public UserResponseDto convertToDto(UserEntity user) {
		
		UserResponseDto dto = new UserResponseDto();
		dto.setEmail(user.getEmail());
		dto.setName(user.getName());
		dto.setPhone(user.getPhone());
		
		return dto;
		
	}

}
