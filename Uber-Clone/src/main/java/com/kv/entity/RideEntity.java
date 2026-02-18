package com.kv.entity;

import java.time.LocalDateTime;

import com.kv.RideStatus.DriverStatus;
import com.kv.RideStatus.RideStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "Ride_Entity")
@Data
public class RideEntity {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pickup_lat")
    private Double pickupLat;

    @Column(name = "pickup_long")
    private Double pickupLong;

    @Column(name = "drop_lat")
    private Double dropLat;

    @Column(name = "drop_long")
    private Double dropLong;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RideStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "Driver_status")
    private DriverStatus driverStatus;


    @Column(name = "created_at")
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private LocalDateTime startedAt;
    
 // === ASSOCIATIONS ===
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "driver_id", referencedColumnName = "id")
    private DriverEntity driver;
}

	
