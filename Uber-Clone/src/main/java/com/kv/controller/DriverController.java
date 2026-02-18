package com.kv.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kv.RideStatus.DriverStatus;
import com.kv.RideStatus.VehicleType;
import com.kv.entity.DriverEntity;
import com.kv.repository.DriverRepository;
import com.kv.service.IDriverService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/driver")
public class DriverController {

	@Autowired
	private IDriverService driverService;
	
	@Autowired
	private DriverRepository driverRepo;
	
	// Register driver
    @PostMapping("/register")
    public DriverEntity registerDriver(@RequestBody DriverEntity driver) {
        return driverService.registerDriver(driver);
    }
	
	@PutMapping("/update-Location/{driver_id}")
	public DriverEntity updateLocation(@PathVariable Long driver_id,
											@RequestParam double latitude,
											@RequestParam double longitude) { 
		return driverService.updateLocation(driver_id, latitude, longitude);
				
	}
	
	 // Get all available drivers
    @GetMapping("/available")
    public List<DriverEntity> getAvailableDrivers(@RequestParam(required = false) VehicleType vehicleType) {
        if (vehicleType != null) {
            return driverService.getAvailableDrivers(vehicleType);
        } 
        return driverRepo.findByStatus(DriverStatus.AVAILABLE);
        }
}
