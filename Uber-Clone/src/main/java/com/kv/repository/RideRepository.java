package com.kv.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.kv.RideStatus.RideStatus;
import com.kv.entity.DriverEntity;
import com.kv.entity.RideEntity;
import com.kv.entity.UserEntity;

import io.lettuce.core.dynamic.annotation.Param;

@Repository
public interface RideRepository extends JpaRepository<RideEntity, Long> {

	// Find By User
	List<RideEntity> findByUser(UserEntity user);
	
	List<RideEntity> findByDriver(DriverEntity driver);
	
	List<RideEntity> findByStatus(RideStatus status);
	
	List<RideEntity> findByStatusAndDriverIsNull(RideStatus status);

	
	@Modifying
	@Query("""
	    UPDATE RideEntity r
	       SET r.status = com.kv.RideStatus.RideStatus.ACCEPTED,
	           r.driver = :driver,
	           r.assignedAt = CURRENT_TIMESTAMP
	     WHERE r.id = :rideId
	       AND r.status = com.kv.RideStatus.RideStatus.REQUESTED
	       AND r.driver IS NULL
	""")
	int acceptRideAtomic(@Param("rideId") Long rideId, @Param("driver") DriverEntity driver);

	@Query("""
			   SELECT r FROM RideEntity r
			   WHERE r.user.id = :userId
			     AND r.status IN :statuses
			   ORDER BY r.createdAt DESC
			""")
			List<RideEntity> findActiveRidesForUser(
			        @Param("userId") Long userId,
			        @Param("statuses") List<RideStatus> statuses
			);
}
