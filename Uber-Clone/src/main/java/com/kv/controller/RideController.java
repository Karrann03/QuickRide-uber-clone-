package com.kv.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kv.dto.RideRequestDto;
import com.kv.dto.RideResponseDto;
import com.kv.service.IRideService;

import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/ride")
@Tag(name = "Ride APIs", description = "Operations related to ride booking")
public class RideController {

	@Autowired
	private IRideService rideService;

	
	@PostMapping("/request")
	public ResponseEntity<RideResponseDto> requestRide(@RequestBody RideRequestDto request) {
		
		RideResponseDto dto = rideService.requestRide(request);
		return ResponseEntity.ok(dto);
	}
	

    @GetMapping("rideId/{rideId}")
    public ResponseEntity<RideResponseDto> getRideById(@PathVariable Long rideId) {
    	RideResponseDto dto = rideService.getRideById(rideId);
		return ResponseEntity.ok(dto);
    }
    
    
    @PostMapping("/{rideId}/{status}")
    public ResponseEntity<RideResponseDto> updateRideStatus(@PathVariable Long rideId, @PathVariable String status) {
		return ResponseEntity.ok(rideService.updateRideStatus(rideId, status));
	}
    
    @PostMapping("/end/{rideId}")
    public ResponseEntity<RideResponseDto> endRide(@PathVariable Long rideId) {
		return ResponseEntity.ok(rideService.endRide(rideId));
	}
}
