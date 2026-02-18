package com.kv.service;

import java.util.List;

import com.kv.RideStatus.VehicleType;
import com.kv.entity.DriverEntity;

public interface IDriverService {

	DriverEntity registerDriver(DriverEntity driver);
	DriverEntity updateLocation(Long d_id, double latitude, double longitude);
	DriverEntity setDriverAvailabilty(Long d_id);
	List<DriverEntity> getAvailableDrivers(VehicleType type);
}
