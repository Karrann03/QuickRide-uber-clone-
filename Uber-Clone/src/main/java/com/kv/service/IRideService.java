package com.kv.service;

import com.kv.dto.RideRequestDto;
import com.kv.dto.RideResponseDto;

public interface IRideService {

	RideResponseDto requestRide(RideRequestDto request);
}
