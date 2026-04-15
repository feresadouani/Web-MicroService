package com.example.reservation.repository;

import com.example.reservation.entity.Reservation;
import com.example.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    List<Reservation> findByUserId(Long userId);
    
    List<Reservation> findByStatus(ReservationStatus status);
    
    List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status);
    
    List<Reservation> findByReservationDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    Optional<Reservation> findBySalleNum(Long salleNum);
}
