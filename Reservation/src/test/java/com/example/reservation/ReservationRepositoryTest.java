package com.example.reservation;

import com.example.reservation.entity.Reservation;
import com.example.reservation.entity.ReservationStatus;
import com.example.reservation.repository.ReservationRepository;
import com.example.reservation.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
public class ReservationRepositoryTest {

  /*  @Autowired
    private ReservationRepository reservationRepository;

    private Reservation testReservation;

    @BeforeEach
    public void setUp() {
        testReservation = new Reservation();
        testReservation.setUserId(1L);
        testReservation.setEventId(1L);
        testReservation.setReservationDate(LocalDateTime.now().plusDays(7));
        testReservation.setStatus(ReservationStatus.PENDING);
        testReservation.setNotes("Test reservation");
    }

    @Test
    public void testSaveReservation() {
        Reservation saved = reservationRepository.save(testReservation);
        assertNotNull(saved.getId());
        assertEquals(1L, saved.getUserId());
        assertEquals(1L, saved.getEventId());
    }

    @Test
    public void testFindByUserId() {
        reservationRepository.save(testReservation);
        var reservations = reservationRepository.findByUserId(1L);
        assertFalse(reservations.isEmpty());
    }

    @Test
    public void testFindByStatus() {
        reservationRepository.save(testReservation);
        var reservations = reservationRepository.findByStatus(ReservationStatus.PENDING);
        assertFalse(reservations.isEmpty());
    }*/
}
