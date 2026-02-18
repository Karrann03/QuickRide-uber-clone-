package com.kv.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kv.RideStatus.DriverStatus;
import com.kv.RideStatus.VehicleType;
import com.kv.entity.DriverEntity;
import com.kv.repository.DriverRepository;

@Service
public class DriverServiceImpl implements IDriverService {

	@Autowired
	private DriverRepository driverRepo;
	
	@Override
	public DriverEntity updateLocation(Long d_id, double latitude, double longitude) {
		DriverEntity driver = driverRepo.findById(d_id).orElseThrow(() -> 
								new RuntimeException("Driver Not Found"));
		driver.setCurrentLat(latitude);
		driver.setCurrentLong(longitude);
		return driverRepo.save(driver);
	}

	@Override
	public DriverEntity setDriverAvailabilty(Long d_id) {
		DriverEntity driver = driverRepo.findById(d_id).orElseThrow(() -> new RuntimeException("Driver Not Found"));
		driver.setStatus(DriverStatus.AVAILABLE);
		return driverRepo.save(driver);
	}

	@Override
	public List<DriverEntity> getAvailableDrivers(VehicleType type) {
		return driverRepo.findByStatusAndVehicleType(DriverStatus.AVAILABLE, type);
	}

	@Override
	public DriverEntity registerDriver(DriverEntity driver) {
		driver.setStatus(DriverStatus.AVAILABLE);
		return driverRepo.save(driver);
		
	}

}
