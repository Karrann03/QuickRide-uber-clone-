package com.kv.service.driver;

import java.util.List;

import com.kv.RideStatus.DriverStatus;
import com.kv.RideStatus.VehicleType;
import com.kv.dto.neabyDto;
import com.kv.entity.DriverEntity;

public interface IDriverService {

	DriverEntity registerDriver(DriverEntity driver);
	DriverEntity updateLocation(Long d_id, double latitude, double longitude);
	DriverEntity setDriverAvailabilty(Long d_id);
	void acceptRide(Long driverId, Long rideId);
	void rejectRide(Long driverId, Long rideId);
	List<DriverEntity> getAvailableDriversWithVehicle(VehicleType type);
	List<DriverEntity> getAvailableDrivers();
}
