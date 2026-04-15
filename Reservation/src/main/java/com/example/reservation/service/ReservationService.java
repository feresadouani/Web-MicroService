package com.example.reservation.service;

import com.example.reservation.entity.Reservation;
import com.example.reservation.entity.ReservationStatus;
import com.example.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    
    /**
     * Get all reservations
     */
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }
    
    /**
     * Get reservation by ID
     */
    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }
    
    /**
     * Get all reservations for a specific user
     */
    public List<Reservation> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }
    
    /**
     * Get all reservations with a specific status
     */
    public List<Reservation> getReservationsByStatus(ReservationStatus status) {
        return reservationRepository.findByStatus(status);
    }
    
    /**
     * Get all reservations for a user with a specific status
     */
    public List<Reservation> getReservationsByUserIdAndStatus(Long userId, ReservationStatus status) {
        return reservationRepository.findByUserIdAndStatus(userId, status);
    }
    
    /**
     * Get reservations within a date range
     */
    public List<Reservation> getReservationsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return reservationRepository.findByReservationDateBetween(startDate, endDate);
    }
    
    /**
     * Get reservation by SalleNum
     */
    public Optional<Reservation> getReservationBySalleNum(Long salleNum) {
        return reservationRepository.findBySalleNum(salleNum);
    }
    
    /**
     * Create a new reservation
     */
    public Reservation createReservation(Reservation reservation) {
        if (reservation.getStatus() == null) {
            reservation.setStatus(ReservationStatus.PENDING);
        }
        return reservationRepository.save(reservation);
    }
    
    /**
     * Update an existing reservation
     */
    public Reservation updateReservation(Long id, Reservation updatedReservation) {
        Optional<Reservation> optional = reservationRepository.findById(id);
        if (optional.isPresent()) {
            Reservation reservation = optional.get();
            
            if (updatedReservation.getUserId() != null) {
                reservation.setUserId(updatedReservation.getUserId());
            }
            if (updatedReservation.getSalleNum() != null) {
                reservation.setSalleNum(updatedReservation.getSalleNum());
            }
            if (updatedReservation.getReservationDate() != null) {
                reservation.setReservationDate(updatedReservation.getReservationDate());
            }
            if (updatedReservation.getStatus() != null) {
                reservation.setStatus(updatedReservation.getStatus());
            }
            if (updatedReservation.getNotes() != null) {
                reservation.setNotes(updatedReservation.getNotes());
            }
            
            return reservationRepository.save(reservation);
        }
        return null;
    }
    
    /**
     * Update reservation status
     */
    public Reservation updateReservationStatus(Long id, ReservationStatus newStatus) {
        Optional<Reservation> optional = reservationRepository.findById(id);
        if (optional.isPresent()) {
            Reservation reservation = optional.get();
            reservation.setStatus(newStatus);
            return reservationRepository.save(reservation);
        }
        return null;
    }
    
    /**
     * Cancel a reservation
     */
    public Reservation cancelReservation(Long id) {
        return updateReservationStatus(id, ReservationStatus.CANCELLED);
    }
    
    /**
     * Confirm a reservation
     */
    public Reservation confirmReservation(Long id) {
        return updateReservationStatus(id, ReservationStatus.CONFIRMED);
    }
    
    /**
     * Delete a reservation
     */
    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
}
